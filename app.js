var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const axios = require('axios');

var adminRouter = require('.//routes/admin');
var homeRouter = require('./routes/home');
var listRouter = require('./routes/my-list');
var friendsRouter = require('./routes/friends');
var loadRouter = require('./routes/load');
var settingsRouter = require('./routes/settings');

var app = express();

// Connect to mongoDB Database 
const mongoose = require('mongoose');
mongoose.connect("mongodb+srv://heroku:Alpha2Star@cluster0.hmcxw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority", {
  useUnifiedTopology: true,
  useNewUrlParser: true
});

const { auth } = require('express-openid-connect');
const config = {
  authRequired: false,
  auth0Logout: true,
  secret: 'a long, randomly-generated string stored in env',
  baseURL: 'http://localhost:3000/',
  //baseURL: 'https://bcs-cinematch.herokuapp.com/',
  clientID: 'JBkaortATzYpOG4vfArvZOhKe7TBVIFr',
  issuerBaseURL: 'https://dev-igdtmyli.us.auth0.com'
};

// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const { requiresAuth } = require('express-openid-connect');
app.use('/', requiresAuth(), homeRouter);
app.use('/admin', requiresAuth(), adminRouter);
app.use('/friends', requiresAuth(), friendsRouter);
app.use('/home', requiresAuth(), homeRouter);
app.use('/my-list', requiresAuth(), listRouter);
app.use('/load', requiresAuth(), loadRouter);
app.use('/settings', requiresAuth(), settingsRouter);/*(req, res) => {
  res.send(JSON.stringify(req.oidc.user));
});*/

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
