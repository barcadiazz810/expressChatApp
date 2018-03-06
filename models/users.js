var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var Schema = mongoose.Schema;
var schema = new Schema({
  socket_id: {type:String, required: true},
  email: {type:String, required:true},
  password: {type: String, required:true},
  nickName: {type:String, required:true},
  userId: {type:String, required:true},
  online:{type: Boolean, required:true}
});

schema.methods.encryptPassword=function(password){
  return bcrypt.hashSync(password, bcrypt.genSaltSync(5), null);
};

schema.methods.validPassword = function(password){
  return bcrypt.compareSync(password, this.password);
};

module.exports= mongoose.model('user_details', schema);
