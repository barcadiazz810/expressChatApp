var express = require('express');
var router = express.Router();
var user_schema = require('../models/users');
var csurf = require('csurf');
var csurfProtection = csurf();
router.use(csurfProtection);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});


router.get('/chatRoom', isLoggedIn ,function(req, res, next)
{
  user_schema.find({email: req.user.email},{_id:1, nickName:1}, function(err, user)
  {
    if(err)
    {
      console.log(err);
    }
    user_schema.aggregate(
      [
  		  {$lookup:{ from: "messages", localField: "userId", foreignField: "userId", as : "userMessages"}},
  		  {$unwind: "$userMessages"},
  		  {$project:{nickName:1, message: "$userMessages.message", messageId: "$userMessages._id", time: "$userMessages.time"}},
  		  {$sort:{messageId: -1}}
  	  ],function(err, result)
      {
        if(err)
        {
          console.log(err);
        }
        result.reverse();
        res.render('chatRoom',{prev_msg: result, nickName: user[0]['nickName'], userId: user[0]['_id']});
      });
  });
});

module.exports = router;

function isLoggedIn(req, res, next){
  if(req.isAuthenticated())
  {
    next();
  }
  else
  {
    res.render('user/signIn',{csrfToken: req.csrfToken()});
  }
};
