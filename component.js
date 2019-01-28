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

module.exports = {
  getCompatibleId: function(user) {
    arr = JSON.parse(user.compatibility);
    b = arr.sort(function(a,b){
      return b.value - a.value;
    });
    // b = Object.keys(arr).map(function(key) {
    //   return [Number(key), arr[key]];
    // });
    if(user.active == null)
    {
      index = 0;
    }else{
      last_id = user.active.toString();
      index = b.findIndex(x => x.user_id==last_id.toString());
      profile_status = JSON.parse(user.profile_status);
      index_p = profile_status.findIndex(x => x.user_id==last_id.toString());
      // console.log('index_p',index_p);
      if(profile_status[index_p].status != 'P'){
        index = index + 1;
      }
    }
    while (Number.isNaN(parseInt(b[index].user_id))) {
      index++;
    }
    return b[index].user_id;

  },
  formatNumber: function(number){
    formattedNumber = number.substr(number.length - 10);
    formattedNumber = "+91 " + formattedNumber.substr(0,5)+" "+formattedNumber.substr(5);
    if(number == '8092359314')
      formattedNumber = 'Asif Iqbal'
    return formattedNumber;
  },
  getWhatsappPoint: function(user) {
    return user.whatsapp_point;
  },
  getLastMessages: function(chats_data,whatsapp_no) {
    var msg;
    chats_data.forEach(function(chat){
      if(chat.chat.includes(whatsapp_no)) {
        logger.info('Message received for user = '+whatsapp_no);
        var messages_all = chat.messages;
        if(!messages_all[0].contact.includes('918447061463')){
          msg = messages_all[0];
          chat.messages = chat.messages.filter(message => !message.message.includes(msg.message));
        }
        return msg;
      }
    });
    return msg;
  },
  generateProfile: function(profile,with_contact) {
    gender = (profile.gender == 'Female')? 'GIRL' : 'BOY';
    emoji = (profile.gender == 'Female')? '👩' : '👦';
    var today = new Date();
    var birthDate = new Date(profile.birth_date);
    var age = today.getFullYear() - birthDate.getFullYear();
    var height = Math.floor(profile.height/12)+"ft "+(profile.height%12)+"in.";
    if(with_contact == 0){
      var msg = emoji+"PROFILE OF "+gender+" BY *HANS MATRIMONY* BREAK_LINE BREAK_LINE🙎‍♀ *PERSONAL DETAILS* BREAK_LINEName : "+profile.name+"BREAK_LINE Age : "+age+"BREAK_LINE Height : "+height+" BREAK_LINE Caste : "+profile.caste+"BREAK_LINE Birth Date : "+profile.birth_date+"BREAK_LINE Birth Time : "+profile.birth_time+"BREAK_LINE Birth Place : "+profile.birth_place+"BREAK_LINE Occupation : "+profile.occupation+"BREAK_LINE Annual Income : "+profile.monthly_income+" LPABREAK_LINE Education : "+profile.education+"BREAK_LINE Food Choice : "+profile.food_choice+"BREAK_LINE Skin Tone : "+profile.skin_tone+"BREAK_LINE Working City : "+profile.working_city+"BREAK_LINELocality : "+profile.locality+"BREAK_LINE BREAK_LINE👪 *FAMILY DETAILS* BREAK_LINE House : "+profile.house_type+"BREAK_LINE Family : "+profile.family_type+"BREAK_LINE Family Income : "+profile.family_income+" LPABREAK_LINE Fathers Occupation : "+profile.foccupation+"BREAK_LINE BREAK_LINE👉 If interested please reply *YES*.BREAK_LINE BREAK_LINE👉 If not interested please reply 🤚 *NO*BREAK_LINE BREAK_LINE👉 If you are already married or not looking for a match please reply 🤚 *STOP*BREAK_LINE BREAK_LINE👉To register for our 🥇 *personalized service* 🥇 please contact *918447061463*";
    }
    else {
      contact = profile.mobile;
      var msg = emoji+"PROFILE OF "+gender+" BY *HANS MATRIMONY* BREAK_LINE BREAK_LINE🙎‍♀ *PERSONAL DETAILS* BREAK_LINEName : "+profile.name+"BREAK_LINE Age : "+age+"BREAK_LINE Height : "+height+" BREAK_LINE Caste : "+profile.caste+"BREAK_LINE Birth Date : "+profile.birth_date+"BREAK_LINE Birth Time : "+profile.birth_time+"BREAK_LINE Birth Place : "+profile.birth_place+"BREAK_LINE Occupation : "+profile.occupation+"BREAK_LINE Annual Income : "+profile.monthly_income+" LPABREAK_LINE Education : "+profile.education+"BREAK_LINE Food Choice : "+profile.food_choice+"BREAK_LINE Skin Tone : "+profile.skin_tone+"BREAK_LINE Working City : "+profile.working_city+"BREAK_LINELocality : "+profile.locality+"BREAK_LINE BREAK_LINE👪 *FAMILY DETAILS* BREAK_LINE House : "+profile.house_type+"BREAK_LINE Family : "+profile.family_type+"BREAK_LINE Family Income : "+profile.family_income+" LPABREAK_LINE Fathers Occupation : "+profile.foccupation+"BREAK_LINE BREAK_LINE Contact Number : "+contact;
    }
    return msg.replace("null"," ");
  }
}
