const pino = require('pino')
const logger = pino({
  prettyPrint: true,
  crlf: false, // --crlf
  errorLikeObjectKeys: ['err', 'error'], // --errorLikeObjectKeys
  errorProps: '', // --errorProps
  levelFirst: false, // --levelFirst
  messageKey: 'msg',
  translateTime: true, // --messageKey
});
var dateFormat = require('dateformat');
var mysql = require('mysql');
var socket = require('socket.io-client')('http://13.126.4.18');
const connection = require('./connection');
const bot = require('./bot');
const cTable = require('console.table');
var conn = connection.sqlConnection(mysql);
const component = require('./component');
var userList;
var chats_data = [];

// getUserList();
var now = new Date();
logger.info('Started code @ '+dateFormat(now,"mmmm dS, yyyy, h:MM:ss TT"));

function processList(userList){
  userList.forEach(user => {
    user.whatsapp = (user.whatsapp != null)? user.whatsapp : user.mobile;
    if(user.whatsapp.indexOf(',')>-1){
      user.whatsapp = user.whatsapp.split(',')[0];
      user.whatsapp = user.whatsapp.substr(user.whatsapp.length - 10);
    }
    // user.whatsapp = '8092359314';
    if(user.whatsapp==null)
      return;
    processUser(user);
  });
}

function processUser(user){
  logger.info('Processing user = '+user.whatsapp+', user_current = '+user.current+", user_id = "+user.id);
  formattedNumber = component.formatNumber(user.whatsapp);
  if(user.current==6 && user.daily_quota >= 3){
    logger.info('Daily quota reached for user',user.whatsapp);
  }
  else{
    if (user.current == null || user.current == 0 ) {
      sendFirstProfile(user);
      user.current = 1;
    } else if (user.current == 1 || user.current == 4 || user.current == 15 || user.current == 45 || user.current == 105 || user.current == 10 ) {
      startBot(user.whatsapp, user);
    }
  }
}

function sendFirstProfile(user) {
  var profile;
  conn.query(`SELECT profiles.*, DATE_FORMAT(profiles.birth_date, '%M %e, %Y') as birth_date, families.caste, families.locality, families.house_type, families.family_type, families.family_income, families.occupation as foccupation from profiles
     INNER JOIN families ON profiles.id = families.id
     where profiles.id = `+component.getCompatibleId(user) +` and profiles.gender != '`+user.gender+`'LIMIT 1`, function (error, results, fields) {
       if (error) throw error;
       profile = results[0];
       var msg = component.generateProfile(profile,0);
       bot.sendTextMessage(socket,msg,user.whatsapp);
       // bot.sendFileMessage(socket,profile.photo,user.whatsapp,msg);
       logger.info('Sent Profile id = '+ profile.id+' and profile name = '+profile.name+' to user = '+user.whatsapp);
       user.current = 1;
       connection.updateCompatibleTable(conn,user.user_id,user.current,user.profile_status,component.getCompatibleId(user),user.daily_quota+1);
       logger.info('Updated table after sending profile for user = '+user.whatsapp+' ,user_id = '+user.id);

  });
}

function startBot(whatsapp_no, user) {
  logger.info('Bot started for user = '+whatsapp_no+',user_current = '+user.current);
  lastMessage = component.getLastMessages(chats_data,component.formatNumber(whatsapp_no));
  if (typeof(lastMessage) != 'undefined') {
    connection.sendSeenRep(socket,lastMessage.from);
    processState(lastMessage.message, user);
  }
}

function processState(msg, user){
  flag = 0;
  if ((user.current == 1 || user.current == 15) && msg.toUpperCase().includes('NO')) {
    user.current = 3;
    logger.info('In #1, user_current = '+user.current+',message = '+msg.toUpperCase());
  }
  else if ((user.current == 1 || user.current == 15) && msg.toUpperCase().includes('YES')) {
    user.current = 2;
    whatsapp_point = component.getWhatsappPoint(user);
    if (whatsapp_point > 0) {
      user.current = 4;
    } else {
      user.current = 5;
    }
    logger.info('In #2, user_current = '+user.current+',message = '+msg.toUpperCase());
  }
  else if (user.current == 1 && !msg.toUpperCase().includes('YES') && !msg.toUpperCase().includes('NO')) {
    user.current = 15;
    logger.info('In #3, user_current = '+user.current+',message = '+msg.toUpperCase());
  }
  else if ((user.current == 4 || user.current == 45) && msg.toUpperCase().includes('YES')) {
    user.current = 7;
    logger.info('In #4, user_current = '+user.current+',message = '+msg.toUpperCase());
  }
  else if ((user.current == 4 || user.current == 45) && msg.toUpperCase().includes('NO')) {
    user.current = 3;
    logger.info('In #5, user_current = '+user.current+',message = '+msg.toUpperCase());
  }
  else if (user.current == 4 && !msg.toUpperCase().includes('YES') && !msg.toUpperCase().includes('NO')) {
    flag = 1;
    logger.info('In #6, user_current = '+user.current+',message = '+msg.toUpperCase());
  }
  else if ((user.current == 10 || user.current == 105) && msg.toUpperCase().includes('NO') ) {
    logger.info('In #8, user_current = '+user.current+',message = '+msg.toUpperCase());
    user.current = 8;
  }
  else if (user.current == 10 && !msg.toUpperCase().includes('NO') ) {
    logger.info('In #9, user_current = '+user.current+',message = '+msg.toUpperCase());
    user.current = 105;
  }
  else if (user.current == 15 || user.current == 45 || user.current == 105 || user.current == 6) {
    flag = 2;
    logger.info('In #7, user_current = '+user.current+',message = '+msg.toUpperCase());
  }
  else {
    logger.info('In #10, user_current = '+user.current+',message = '+msg.toUpperCase());
  }
   if(flag !=2)
   {
     sendResponse(user.current,user.whatsapp,user.user_id,component.getCompatibleId(user),user.gender);
   }
}

function sendResponse(current,contact,user_id,compatible_id,gender) {
  var response = createResponse(current,user_id,compatible_id);
  if(response != 'NA' && response != 'FP'){
    bot.sendTextMessage(socket,response,contact);
  }
  else if(response == 'FP'){
    conn.query(`SELECT profiles.*, families.caste, families.locality, families.house_type, families.family_type, families.family_income, families.mobile, families.occupation as foccupation from profiles
       INNER JOIN families ON profiles.id = families.id
       where profiles.id = `+ compatible_id +` and profiles.gender != '`+gender+`'LIMIT 1`, function (error, results, fields) {
         if (error) throw error;
         profile = results[0];
         // console.log(profile);
         var msg = component.generateProfile(profile,1);
         bot.sendTextMessage(socket,msg,contact);
    });
  }
}

function createResponse(state,user_id,compatible_id){
  var response;
  switch (state) {
    case 15: response = "I am sorry I dont understand.BREAK_LINE👉 Please reply *YES* if interested or *NO* if not interested.";
    conn.query(`UPDATE compatibilities SET current = `+15+` WHERE user_id =`+user_id, function (error, results, fields) {
      if (error) throw error;
    });
    break;
    case 3: response = 'Ok thank you! We will get back to you';
    conn.query(`SELECT profile_status FROM compatibilities WHERE user_id = `+user_id, function (error, results, fields) {
      if (error) throw error;
      profile_status = results[0].profile_status;
      profile_status = JSON.parse(profile_status);
      profile_status.forEach(key => {
        if(key.user_id == compatible_id)
          key.status = 'R';
      });
      conn.query(`UPDATE compatibilities SET current = `+6+`, profile_status = '`+JSON.stringify(profile_status)+`' WHERE user_id =`+user_id, function (error, results, fields) {
        if (error) throw error;
      });
    });
    break;

    case 4 : response = "Are you sure you want to receive the profile?";
    conn.query(`UPDATE compatibilities SET current = `+4+` WHERE user_id =`+user_id, function (error, results, fields) {
      if (error) throw error;
    });
    break;
    case 45: response = "I am sorry I dont understand.BREAK_LINE👉 Please reply *YES* if you want to purchase or *NO* if you do not want to purchase now";
    conn.query(`UPDATE compatibilities SET current = `+45+` WHERE user_id =`+user_id, function (error, results, fields) {
      if (error) throw error;
    });
    break;
    case 5 : response =  "You have 0 Whatsapp Points. You need to buy Whatsapp Points to continue,BREAK_LINE Click here to buy Whatsapp points http://hansmatrimony.com/plans BREAK_LINE👉 Please reply *NO* if you do not want to purcahse and want to continue viewing profiles";
    conn.query(`UPDATE compatibilities SET current = `+10+` WHERE user_id =`+user_id, function (error, results, fields) {
      if (error) throw error;
    });
    break;
    case 6: response = "NA";
    break;
    case 7: response = "FP";
    conn.query(`UPDATE compatibilities SET current = `+6+` WHERE user_id =`+user_id, function (error, results, fields) {
      if (error) throw error;
    });
    break;
    case 8: response = 'Ok sure. We will show you more profile';
    conn.query(`SELECT profile_status FROM compatibilities WHERE user_id = `+user_id, function (error, results, fields) {
      if (error) throw error;
      profile_status = results[0].profile_status;
      profile_status = JSON.parse(profile_status);
      profile_status.forEach(key => {
        if(key.user_id == compatible_id)
          key.status = 'R';
      });
      conn.query(`UPDATE compatibilities SET current = `+6+`, profile_status = '`+JSON.stringify(profile_status)+`' WHERE user_id =`+user_id, function (error, results, fields) {
        if (error) throw error;
      });
    });
    break;

    case 105: response = "I am sorry I dont understand.BREAK_LINE👉 Please reply *NO* if you do not want to purchase now and want to view other profiles.";
    conn.query(`UPDATE compatibilities SET current = `+105+` WHERE user_id =`+user_id, function (error, results, fields) {
      if (error) throw error;
    });
    break;
  }
  return response;
}

function getUserList(){
  conn.query(`UPDATE compatibilities SET current = 0 WHERE current = 6 and daily_quota <3`, function (error, results, fields) {
    if (error) throw error;
  });
  conn.query(`SELECT compatibilities.* , profiles.whatsapp, families.mobile, profiles.gender, profiles.id
    FROM ((compatibilities
    INNER JOIN profiles ON compatibilities.user_id = profiles.id)
    INNER JOIN families ON compatibilities.user_id = families.id)
    where daily_quota <=3 and LENGTH(compatibility) > 40 LIMIT 1`, function (error, results, fields) {
    if (error) throw error;
    userList = results;
    processList(userList);
  });
}

function getUnreadReplies() {
  socket.emit("get_unread_replies", {
    sender_mobile: '918447061463'
  });
  socket.on("get_unread_response", (chats) => {
    setChatData(chats);
  });
}

function setChatData(chats){
  chats_data = chats;
}
setInterval(() => {
  getUserList();
}, 10000);

setInterval(() => {
  getUnreadReplies();
}, 1000);
