config = require('./config/database');
module.exports = {
  sqlConnection: function(mysql) {
    // var mysql      = require('mysql');
    var connection = mysql.createConnection({
      host     : config.host,
      user     : config.user,
      password : config.password,
      database : config.database
    });
    connection.connect();
    return connection;
  },
  updateCompatibleTable: function(conn,user_id,current,profile_status,compatible_id,daily_quota){
    profile_status = (profile_status == null || profile_status == '')? [] : JSON.parse(profile_status);
    if(current == 1)
    {
      elem = {}
      elem.user_id = compatible_id;
      elem.status = 'P';
      profile_status.push(elem);
      profile_status = JSON.stringify(profile_status);
      conn.query(`UPDATE compatibilities SET current = `+current+`, profile_status = '`+profile_status+`', active = `+compatible_id+`, daily_quota = `+daily_quota+` WHERE user_id =`+user_id, function (error, results, fields) {
        if (error) throw error;
        // console.log('Updated user : '+us);
      });
    }
  },
  sendSeenRep: function(socket,payload) {
    socket.emit('send_seen_reply', {
      msg_id: payload,
      sender_mobile: '919205125549'
    });
  },
}
