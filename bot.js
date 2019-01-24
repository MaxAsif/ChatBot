module.exports = {
  sendFirstProfile : function(user){
      console.log('ds');
  },
  sendTextMessage: function(socket,msg,whatsapp){
    whatsapp = "91"+whatsapp.substr(whatsapp.length - 10);
    socket.emit("send_text_message", {
      message: msg,
      mobile_number: whatsapp,
      type: "text",
      sender_mobile: '918447061463'
    });
  },
  sendFileMessage: function(socket,url,whatsapp,msg){
  	socket.emit("send_file_message", {
  		file_link: url,
  		mobile_number: whatsapp,
  		type: 'image/jpeg',
  		caption: '',
      sender_mobile: '918447061463'
  	});
  }
}
