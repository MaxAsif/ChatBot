const pino = require('pino');
const AWS = require('aws-sdk');
var mysql = require('mysql');
var socket = require('socket.io-client')('http://13.233.79.202');
const connection = require('../connection');
const bot = require('../bot');
const cTable = require('console.table');
var conn = connection.sqlConnection(mysql);
const component = require('../component');

AWS.config.update({
    accessKeyId: "<Access Key Here>",
    secretAccessKey: "<Secret Access Key Here>"
});

describe('Test sending Message', function() {
  describe('#sendProfile()', function() {
    it('should return 1 when the profile is send', function() {
      conn.query(`SELECT * FROM compatibilities WHERE user_id = `+85805, function (error, results, fields) {
        if (error) throw error;
        user = results[0];
        compatible_id = component.getCompatibleId(user);
        var profile;
        console.log('user_id = ' + user.user_id + "compatible_id" +compatible_id);
        conn.query(`SELECT profiles.*, DATE_FORMAT(profiles.birth_date, '%M %e, %Y') as birth_date, families.caste, families.locality, families.house_type, families.family_type, families.family_income, families.occupation as foccupation from profiles
        INNER JOIN families ON profiles.id = families.id
        where profiles.id = `+ compatible_id +` LIMIT 1`, function (error, results, fields) {
          if (error) throw error;
          profile = results[0];
          var msg = component.generateProfile(profile,0);
          msg.replace("null"," ")
          var whatsapp = '918092359314';
          bot.sendTextMessage(socket,msg,whatsapp);
        });
      });
      return 1;
    });
  });
});

describe('Test get Compatible Id', function() {
  describe('#getCompatibleId()', function() {
    it('should return 1 when the Compatible id is received', function() {
      var profile;
      conn.query(`SELECT compatibilities.* , profiles.whatsapp, families.mobile, profiles.gender, profiles.id
        FROM ((compatibilities
        INNER JOIN profiles ON compatibilities.user_id = profiles.id)
        INNER JOIN families ON compatibilities.user_id = families.id)
        where daily_quota <=3 and LENGTH(compatibility) > 40 LIMIT 1`, function (error, results, fields) {
        if (error) throw error;
        userList = results;
        userList.forEach(user => {
          compatible_id = component.getCompatibleId(user);
          console.log("user_id = "+user.user_id+", compatible_id = "+compatible_id);
        });
      });
      return 1;
    });
  });
});
describe('Test chats receiving or not', function() {
  describe('#getUnreadReplies()', function() {
    it('should return chats when received', function() {
      socket.emit("get_unread_replies", {
        sender_mobile: '919205125549'
      });
      console.log('emit sent');
      socket.on("get_unread_response", (chats) => {
        console.log(chats);
        setChatData(chats);
      });
    });
  });
});
