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
var socket = require('socket.io-client')('http://13.234.113.66');
const connection = require('./connection');
const bot = require('./bot');
const cTable = require('console.table');
var conn = connection.sqlConnection(mysql);
const component = require('./component');
var userList;
var chats_data = [];

function getUnreadReplies() {
  socket.emit("get_unread_replies", {
    sender_mobile: '919205125549'
  });
	// logger.info('emit sent');
  socket.on("get_unread_response", (chats) => {
    // logger.info(chats);
    setChatData(chats);
  });
}
function setChatData(chats){
  chats_data = chats;
}

setInterval(() => {
 processChats(chats_data);
}, 10000);

function processChats(chats_data){
  chats_data.forEach(function(chat){
    if(!chat.isGroup){
      chat.messages.forEach(function(messages){
        if(messages.message.toUpperCase() == 'SHOW'){
          console.log(messages.contact);
          console.log(messages.message);
          contact = messages.contact;
          contact.substr(contact.length - 10);
          conn.query(`UPDATE profiles
            JOIN families ON profiles.id = families.id
            SET profiles.wantBot = 1
            WHERE families.mobile LIKE '%`+ contact +`'`, function (error, results, fields) {
              if (error) throw error;
            });
            connection.sendSeenRep(socket,messages.from);
            // console.log('done',messages.from);
          }
        });
      }
    });
}

function test() {
  conn.query(`UPDATE profiles
    JOIN families ON profiles.id = families.id
    SET profiles.wantBot = 14
    WHERE families.mobile LIKE '%`+ 8092359314 +`'`, function (error, results, fields) {
      if (error) throw error;
      console.log(results.changedRows);
    });

}

setInterval(() => {
   getUnreadReplies();
}, 1000);
