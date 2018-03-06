var passport = require('passport');
var User = require('../models/users');
var localStrategy = require('passport-local').Strategy;

passport.serializeUser(function(user, done){
  done(null, user.id);
});

passport.deserializeUser(function(id, done){
  User.findById(id, function(err, user){
    done(err,user);
  });
});

//SIGNUP
passport.use('signup', new localStrategy(
{
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},function(req, email, password, done)
{
  var nickName = req.body.nickName;
  req.checkBody('email','Invalid Email').notEmpty().isEmail();
  req.checkBody('password', 'Invalid Password').notEmpty().isLength({min:4});
  var errors = req.validationErrors();
  if(errors)
  {
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    return done(null, false, req.flash('error',messages ));
  }

  //CHECK IF EMAIL EXISTS
  User.findOne({'email':email},function(err,user)
  {
    if(err)
    {
      return done(err);
    }
    if(user)
    {
      return done(null, false, {message: 'This email already exists'});
    }

    //CREATE NEW USER
    var newUser = new User();
    newUser.email = email;
    newUser.nickName = nickName;
    newUser.socket_id="null";
    newUser.userId="null";
    newUser.password = newUser.encryptPassword(password);
    newUser.online = true;

    newUser.save(function(err, result)
    {
      if(err)
      {
        return done(err);
      }
      var userId = result['_id'];
      User.update({_id:userId}, {$set:{userId: userId}}, function(err,u_result)
      {
        if(err)
        {
          console.log(err);
        }
        req.session.user = userId;
        req.session.nickName=nickName;
        return done(null, newUser);
      });
    });
    //CREATE NEW USER
  });
  //CHECK IF EMAIL EXISTS
}));
//SIGNUP

//SIGNIN
passport.use('signin', new localStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
},function(req, email, password, done){
  req.checkBody('email',"Invalid email").notEmpty();
  req.checkBody('password',"Invalid password").notEmpty();
  var errors= req.validationErrors();
  if(errors)
  {
    var messages = [];
    errors.forEach(function(error){
      messages.push(error.msg);
    });
    return done(null, false,  req.flash('error', messages));
  }

  User.findOne({'email': email}, function(err,user){
    if(err)
    {
      return done(err);
    }
    if(!user)
    {
      return done(null, false, {message: 'Invalid email or password'});
    }
    if(!user.validPassword(password))
    {
      return done(null, false, {message: 'Invalid email or password'});
    }
    User.update({_id:user['id']},{$set:{online:true}},function(err,result){
      if(err)
      {
        console.log(err);
      }
    });
    req.session.user = user['_id'];
    req.session.nickName = user['nickName'];
    return done(null, user);
  });
}));
//SIGNIN
