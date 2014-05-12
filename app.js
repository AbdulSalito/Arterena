/*
Setup info

install $ apt-get install imagemagick


*/

//http://tonyspiro.com/uploading-and-resizing-an-image-using-node-js/
//http://stackoverflow.com/questions/6984139/how-do-get-the-sha1-hash-of-a-string-in-nodejs
//http://scotch.io/tutorials/javascript/easy-node-authentication-setup-and-local
//https://github.com/Punit239/CMPE203-Project/
//http://www.youtube.com/watch?v=2qwNk31V9Dg
//https://devblog.paypal.com/announcing-restful-nodejs-sdk/



var express = require('express');
var jade = require('jade');
var http = require('http');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var session = require("express-session");
var passport = require('./auth');
//var passport = require('passport');
//var LocalStrategy = require('passport-local');
//var GoogleStrategy = require('passport-google').Strategy;
//var FacebookStrategy = require('passport-facebook').Strategy; 
//var TwitterStrategy = require('passport-twitter').Strategy; 

var routes = require('./routes/index');
var mail = require('./routes/email');

//var PassLocalRoutes = require('./routes/routes');

var app = express();

// view engine setup
app.set('port', process.env.PORT || 3000 );
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
//HTML indention
app.locals.pretty = true;

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cookieParser());
app.use(session({ 
    secret: 'ILoveArterena', 
    maxAge: new Date(Date.now() + 3600000*60*60),
    cookie: { secure: false,
              maxAge: new Date(Date.now() + 3600000*60*60) }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));


//app.use('/', routes);
//app.use('/users', users);


// passport config

// configure DB for Auth
//mongoose.connect('mongodb://localhost/cmpe273');



// Configure apps routes 
app.get('*', function(req, res, next) {
  // put user into res.locals for easy access from templates
  res.locals.user = req.user;

  next();
});

app.get('/', routes.index);
app.get('/upload', routes.upload);
app.post('/uploadPhoto', routes.uploadPhoto);
app.get('/Gallary', routes.Gallary);
//app.get(app, PassLocalRoutes.Gallary);

app.get('/login', routes.login);
app.post('/login', passport.authenticate('local', 
    { successRedirect: '/user',
    failureRedirect: '/login'}
));
app.get('/user', routes.user);
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.get('/register', routes.register);
app.post('/register', routes.makeRegister);


app.get('/addToCart/:id', routes.addToCart);
app.get('/cart', routes.cart);

app.get('/checkOut', routes.checkOut);
//app.post('/checkOut', mail.sendEmail);

app.get('/images/fullSize/:name', routes.getPhoto);

app.get('/contact', function(req, res){
    res.render('contact');
});

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});



module.exports = app;

http.createServer(app).listen(app.get('port'), function (){
    console.log('express is listening at ' + app.get('port'));
});
