var express = require('express');
var router = express.Router();
var passport = require('passport');
var csurf = require('csurf');
var csurfProtection = csurf();
var user_schema = require('../models/users');
router.use(csurfProtection);

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/signup',function(req, res, next){
  user_schema.find({},{nickName:1, _id:0},function(err, nickNames){
    if(err)
    {
      console.log(err);
    }
    if(nickNames)
    {
      var messages=req.flash('error');
      res.render('user/signUp',{csrfToken: req.csrfToken(), messages:messages, hasErrors: messages.length > 0, nickNames:JSON.stringify(nickNames)});
    }
  });

});

router.get('/signin',function(req, res, next){
  var messages=req.flash('error');
  res.render('user/signIn',{csrfToken: req.csrfToken(), messages:messages, hasErrors: messages.length > 0});
});

router.post('/signup', passport.authenticate('signup',{
  successRedirect:'../chatRoom',
  failureRedirect: '/user/signup',
  failureFlash: true
}));

router.post('/signin', passport.authenticate('signin',{
  successRedirect:'../chatRoom',
  failureRedirect: '/user/signin',
  failureFlash: true
}));

router.get('/logout',function(req, res, next){
  res.render('user/logout',{csrfToken:req.csrfToken()});
});

router.post('/logout',function(req,res,next){
  req.logout();
  res.redirect('/');
});

module.exports = router;
