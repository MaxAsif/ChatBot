module.exports = {
  sendTextMessage: function(socket,msg,whatsapp){
    whatsapp = "91"+whatsapp.substr(whatsapp.length - 10);
    socket.emit("send_text_message", {
      message: msg,
      mobile_number: whatsapp,
      type: "text",
      sender_mobile: '919205125549'
    });
  },
  sendFileMessage: function(socket,url,whatsapp,msg){
    // console.log('https://s3.ap-south-1.amazonaws.com/hansmatrimony/uploads/'+url);
    whatsapp = "91"+whatsapp.substr(whatsapp.length - 10);
  	socket.emit("send_file_message", {
  		file_link: 'https://s3.ap-south-1.amazonaws.com/hansmatrimony/uploads/'+url,
  		mobile_number: whatsapp,
  		type: 'file',
  		caption: msg,
      sender_mobile: '919205125549'
  	});
  }
}
