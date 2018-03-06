var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var expressHBS = require('express-handlebars');
var socket = require('./socket/socket');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
/*mongoose.connect('MONGO_URL',
{
  useMongoClient: true
});*/
mongoose.connect('localhost:27017/socket_chatApp');
/*mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error:`+err);
  process.exit(1);
});*/
var session = require('express-session');
var mongoStore = require('connect-mongo')(session);
var passport = require('passport');
var flash = require('connect-flash');
var validator = require('express-validator');
require('./config/passport');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
app.io= require('socket.io')();
socket(app.io);

// view engine setup
app.engine(".hbs",expressHBS({defaultLayout: 'layout', extname: '.hbs'}))
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: 'session_secret_',
  resave: false,
  saveUninitialized: false,
  store: new mongoStore({ mongooseConnection: mongoose.connection }),
  cookie: {maxAge: 600000 }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function(req, res, next){
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session
  next();
});

app.use('/user', users);
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
