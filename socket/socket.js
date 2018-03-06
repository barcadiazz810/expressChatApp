function socket(io)
{
  var mongoose = require('mongoose');
  mongoose.connect('localhost:27017/socket_chatApp');
  var user_schema= require('../models/users');
  var Message_schema = require('../models/messages');
  var moment = require('moment');
  var User=[];
  io.on('connection', function(socket)
  {
    //NEW CONNECTION
    socket.on('new connection', function(user)
    {
      //UPDATE USER WITH NEW SOCKET ID
      user_schema.update({_id:user.userId}, {$set:{socket_id:socket.id}},function(err,result)
      {
        if(err)
        {
          console.log(err);
        }
        if(result)
        {
          user_schema.findById({_id:user.userId},{_id:0, nickName:1}, function(err,user)
          {
            User['nickName']=user['nickName'];
            User['userId']=user.userId;
            socket.broadcast.emit('joined', {msg: user['nickName']+" Joined!!"});
            socket.emit('welcome', {msg: "Welcome "+user['nickName']});
          });
        }
      });
      //UPDATE USER WITH NEW SOCKET ID
    });
    //NEW CONNECTION

    //SUCCESSFULL LOGOUTs
    socket.on('logout', function()
    {
      user_schema.update({userId:User['userId']},{$set:{online:false}},function(err,result)
      {
        if(err)
        {
          console.log(err);
        }
        if(result)
        {
          console.log("online:false");
        }
        socket.emit('logout',{redirect:true});
        socket.broadcast.emit('disconnected',{msg:User['nickName']+" Left the conversation"})
      });
    })
    //SUCCESSFULL LOGOUTs

    socket.on('message',function(msg)
    {
      var message_schema = new Message_schema();
      message_schema.userId = msg.userId;
      message_schema.message = msg.message;
      message_schema.time = moment().format('YYYY-MM-DD HH:mm:ss');
      message_schema.save(function(err, result){
        if(err)
        {
          console.log(err);
        }
        if(result)
        {
          user_schema.findById({_id:msg.userId},{_id:0, nickName:1}, function(err,user){
            socket.broadcast.emit('new message', {nickName:user['nickName'], message:msg.message});
          });
        }
      });
    });
  });
}

module.exports = socket;
