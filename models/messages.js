var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var schema = new Schema({
  userId: {type: String, required:true},
  message: {type:String, required:true},
  time: {type:Date, required:true}
},
{
  capped:{
    size:10000000,
    max:50,
    autoIndexId:true
  }
});

module.exports= mongoose.model('messages', schema);
