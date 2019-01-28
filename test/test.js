const pino = require('pino');
const AWS = require('aws-sdk');
var mysql = require('mysql');
var socket = require('socket.io-client')('http://13.126.4.18');
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
      var profile;
      conn.query(`SELECT profiles.*, DATE_FORMAT(profiles.birth_date, '%M %e, %Y') as birth_date, families.caste, families.locality, families.house_type, families.family_type, families.family_income, families.occupation as foccupation from profiles
         INNER JOIN families ON profiles.id = families.id
         where profiles.id = 245 LIMIT 1`, function (error, results, fields) {
           if (error) throw error;
           profile = results[0];
           // console.log(profile);
           var msg = component.generateProfile(profile,0);
           msg.replace("null"," ")
           var whatsapp = '918092359314';
           bot.sendTextMessage(socket,msg,whatsapp);
           // bot.sendFileMessage(socket,profile.photo,whatsapp,msg);
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
