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
    var gender = (profile.gender == 'Female')? 'GIRL' : 'BOY';
    var emoji = (profile.gender == 'Female')? '👩' : '👦';
    var msg = '';
    var url = 'http://partner.hansmatrimony.com/api/picUrl/'+profile.id;
    if(profile.photo != null && profile.photo != '')
      msg = 'Profile Pic Url : '+url;
    msg = msg + 'BREAK_LINE'+emoji+"PROFILE OF "+gender+" BY *HANS MATRIMONY* BREAK_LINE BREAK_LINE" + emoji + "‍ *PERSONAL DETAILS* BREAK_LINE";
    if(profile.name != null && profile.name !='')
      msg = msg + "Name : "+profile.name+"BREAK_LINE";
    var today = new Date();
    var birthDate = new Date(profile.birth_date);
    var age = today.getFullYear() - birthDate.getFullYear();
    if(age != null && age != '')
      msg = msg + "Age : "+age+"BREAK_LINE";
    var height = Math.floor(profile.height/12)+"ft "+(profile.height%12)+"in.";
    if(profile.height != null && profile.height != '')
      msg = msg + "Height : "+height+"BREAK_LINE";
    if(profile.weight != null && profile.weight != '')
      msg = msg + "Weight : "+profile.weight+"BREAK_LINE";
    if(profile.caste != null && profile.caste != '')
      msg = msg + "Caste : "+profile.caste+"BREAK_LINE";
    if(profile.birth_date != null && profile.birth_date != '')
      msg = msg + "Birth Date : "+profile.birth_date+"BREAK_LINE";
    if(profile.birth_time != null && profile.birth_time != '')
      msg = msg + "Birth Time : "+profile.birth_time+"BREAK_LINE";
    if(profile.birth_place != null && profile.birth_place != '')
      msg = msg + "Birth Place : "+profile.birth_place+"BREAK_LINE";
    if(profile.occupation != null && profile.occupation != '')
      msg = msg + "Occupation : "+profile.occupation+"BREAK_LINE";
    if(profile.monthly_income != null && profile.monthly_income != '')
      msg = msg + "Annual Income : "+(profile.monthly_income)/100000+" LPA BREAK_LINE";
    if(profile.education != null && profile.education != '')
      msg = msg + "Education : "+profile.education+"BREAK_LINE";
    if(profile.degree != null && profile.degree != '')
      msg = msg + "Degree : "+profile.degree+"BREAK_LINE";
    if(profile.college != null && profile.college != '')
      msg = msg + "College : "+profile.college+"BREAK_LINE";
    if(profile.food_choice != null && profile.food_choice != '')
      msg = msg + "Food Choice : "+profile.food_choice+"BREAK_LINE";
    if(profile.skin_tone != null && profile.skin_tone != '')
      msg = msg + "Skin one : "+profile.skin_tone+"BREAK_LINE";
    if(profile.working_city != null && profile.working_city != '')
      msg = msg + "Working City : "+profile.working_city+"BREAK_LINE";
    if(profile.locality != null && profile.locality != '')
      msg = msg + "Locality : "+profile.locality+"BREAK_LINE";
    if(profile.marital_status != null && profile.marital_status != '')
      msg = msg + "Marital Status : "+profile.marital_status+"BREAK_LINE";
    if(profile.manglik != null && profile.manglik != '')
      msg = msg + "Marital Status : "+profile.manglik+"BREAK_LINE";

    msg = msg + "BREAK_LINE👪 *FAMILY DETAILS* BREAK_LINE"

    if(profile.house_type != null && profile.house_type != '')
      msg = msg + "House : "+profile.house_type+"BREAK_LINE";
    if(profile.family_type != null && profile.family_type != '')
      msg = msg + "Family : "+profile.family_type+"BREAK_LINE";
    if(profile.family_income != null && profile.family_income != '')
      msg = msg + "Family Income : "+(profile.family_income)/100000+" LPA BREAK_LINE";
    if(profile.foccupation != null && profile.foccupation != '')
      msg = msg + "Fathers Occupation : "+profile.foccupation+"BREAK_LINE";

    if(with_contact == 0)
      msg = msg + "BREAK_LINE👉 If interested please reply *YES*.BREAK_LINE BREAK_LINE👉 If not interested please reply *NO*BREAK_LINE BREAK_LINE👉 If you are already married or not looking for a match please reply *STOP*BREAK_LINE BREAK_LINE👉To register for our 🥇 *personalized service* 🥇 please contact *919818215182*";
    else {
      msg = msg + "Contact Number : "+profile.mobile;
    }
    return msg.replace("null"," ");

  },

  generateProfile1: function(profile,with_contact) {
    gender = (profile.gender == 'Female')? 'GIRL' : 'BOY';
    emoji = (profile.gender == 'Female')? '👩' : '👦';
    var today = new Date();
    var birthDate = new Date(profile.birth_date);
    var age = today.getFullYear() - birthDate.getFullYear();
    var url = 'http://partner.hansmatrimony.com/api/picUrl/'+profile.id;
    var height = Math.floor(profile.height/12)+"ft "+(profile.height%12)+"in.";
    if(with_contact == 0){
      var msg = url+'BREAK_LINE'+emoji+"PROFILE OF "+gender+" BY *HANS MATRIMONY* BREAK_LINE BREAK_LINE‍*PERSONAL DETAILS* BREAK_LINEName : "+profile.name+"BREAK_LINE Age : "+age+"BREAK_LINE Height : "+height+" BREAK_LINE Caste : "+profile.caste+"BREAK_LINE Birth Date : "+profile.birth_date+"BREAK_LINE Birth Time : "+profile.birth_time+"BREAK_LINE Birth Place : "+profile.birth_place+"BREAK_LINE Occupation : "+profile.occupation+"BREAK_LINE Annual Income : "+profile.monthly_income+" LPABREAK_LINE Education : "+profile.education+"BREAK_LINE Food Choice : "+profile.food_choice+"BREAK_LINE Skin Tone : "+profile.skin_tone+"BREAK_LINE Working City : "+profile.working_city+"BREAK_LINELocality : "+profile.locality+"BREAK_LINE BREAK_LINE👪 *FAMILY DETAILS* BREAK_LINE House : "+profile.house_type+"BREAK_LINE Family : "+profile.family_type+"BREAK_LINE Family Income : "+profile.family_income+" LPABREAK_LINE Fathers Occupation : "+profile.foccupation+"BREAK_LINE BREAK_LINE👉 If interested please reply *YES*.BREAK_LINE BREAK_LINE👉 If not interested please reply *NO*BREAK_LINE BREAK_LINE👉 If you are already married or not looking for a match please reply *STOP*BREAK_LINE BREAK_LINE👉To register for our 🥇 *personalized service* 🥇 please contact *919818215182*";
    }
    else {
      contact = profile.mobile;
      var msg = url+'BREAK_LINE'+emoji+"PROFILE OF "+gender+" BY *HANS MATRIMONY* BREAK_LINE BREAK_LINE*PERSONAL DETAILS* BREAK_LINEName : "+profile.name+"BREAK_LINE Age : "+age+"BREAK_LINE Height : "+height+" BREAK_LINE Caste : "+profile.caste+"BREAK_LINE Birth Date : "+profile.birth_date+"BREAK_LINE Birth Time : "+profile.birth_time+"BREAK_LINE Birth Place : "+profile.birth_place+"BREAK_LINE Occupation : "+profile.occupation+"BREAK_LINE Annual Income : "+profile.monthly_income+" LPABREAK_LINE Education : "+profile.education+"BREAK_LINE Food Choice : "+profile.food_choice+"BREAK_LINE Skin Tone : "+profile.skin_tone+"BREAK_LINE Working City : "+profile.working_city+"BREAK_LINELocality : "+profile.locality+"BREAK_LINE BREAK_LINE👪 *FAMILY DETAILS* BREAK_LINE House : "+profile.house_type+"BREAK_LINE Family : "+profile.family_type+"BREAK_LINE Family Income : "+profile.family_income+" LPABREAK_LINE Fathers Occupation : "+profile.foccupation+"BREAK_LINE BREAK_LINE Contact Number : "+contact;
    }
    return msg.replace("null"," ");
  }
}
