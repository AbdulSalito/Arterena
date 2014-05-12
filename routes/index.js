var express = require('express');
var mongoose = require('mongoose');
var fs = require('fs');
var imagemagick = require('imagemagick');
var formidable = require('formidable');
var util = require('util');
var path = require('path');
var imageSize = require('image-size');
var gm = require('gm');
var authPath = path.normalize(__dirname + "../../auth");
var passport = require(authPath);
var crypto = require('crypto');
var nodemailer = require('nodemailer');

// mongoose connection and calling schemas
mongoose.connect('mongodb://localhost/cmpe273');
var SchemaPath = path.normalize(__dirname + '../../schema/db_schema');
var models = require(SchemaPath);
var photoModel = mongoose.model('photoModel');
var carts = mongoose.model('carts');
var userInfo = mongoose.model('userInfo');
var orders = mongoose.model('orders');


// build home page
exports.index = function(req, res){
  if (req.session.passport.user === undefined) {
    res.redirect('/login');
  } else {
    res.redirect('/user');
  }
};

// build upload page
exports.upload = function(req, res){
  res.render('upload', { title: 'Arterena' });
};

// build user page
exports.user = function(req, res){
  if (req.session.passport.user === undefined) {
    res.redirect('/login');
  } else {
    var user = userInfo.findOne({username: req.session.passport.user},
    function(err, users) {
        ////////////////////////////////////
      var sentData = [];
      orders.find({user: users._id})
      .populate('itemID')
      .populate('user')
      .exec(function (err, ordr) {
      if (err) return console.error(err);
        var orderDataTotal = 0;
        var photoDataTotal = 0;
        var arrOrder = new Array();
        var arrPhoto = new Array();
        var orderData = new Array();
        //console.log(ordr);
        ordr.forEach(function(item){
          item.itemID.forEach(function(itemID){
            arrOrder.push(itemID);
            orderDataTotal++;
          });
        });
        photoModel.find({user: users._id} , function(err, photos){
          photos.forEach(function(photo){
            photoDataTotal ++;
            arrPhoto.push(photo)
          });
        });
        var sentData = { orderData: arrOrder,
                         photoData: arrPhoto,
                         orderDataTotal: orderDataTotal,
                         photoDataTotal: photoDataTotal};
        //console.log(sentData);
        res.render('user', sentData);
      });
      //res.render('user', { title: 'login', user: 'admin' });
      /////////////////////////////////////////////
    });
  }
};

exports.Gallary = function(req, res){
  photoModel.find(function(err, photos) {
    if (err) return console.error(err);
    for (var x in photos) {
      photos[x].size = photos[x].size / 1024;
      photos[x].size = Number(photos[x].size).toFixed(0);
      //console.log();
    };
    var sentData = {data: photos};
    res.render('Gallary', sentData);
    console.log(sentData);
  });
};

exports.uploadPhoto = function (req, res) {
  if (req.session.passport.user === undefined) {
    res.redirect('/login');
  } else {
    var user = userInfo.findOne({username: req.session.passport.user},
    function(err, users) {
      var form = new formidable.IncomingForm();
      form.parse(req, function(err, fields, files) {

        fs.readFile(files.image.path, function (err, data) {
          var date = new Date().toISOString()
          .replace(/T/, '')
          .replace(/:/g, '')
          .replace(/-/g, '')
          .replace(/\..+/, '');
          var name = files.image.name;
          var imageName = date +'_'+ name;
          var thumbName = 'thumb' + date +'_'+ name;
          var direction = path.normalize(__dirname + "../../public/images/");

          /// If there's an error
          if(!imageName){
              console.log("There was an error")
              res.render('uploadPhoto',{msg:"Somthing went wrong",imgSrc:""}); 
          } else {
            var newPath = direction + "orginal/" + imageName;
            //var thumbPic = gm(imageName).resize(353, 257);
            var thumbPath = direction + "../../public/images/thumbs/" + thumbName;
            var imgPath = "images/thumbs/" + thumbName;

            /// write file to uploads/fullsize folder
            fs.writeFile(newPath, data, function (err) {
              imageSize(newPath, function (err, dimensions) {
                var stats = fs.statSync(newPath)
               //var fileSizeInBytes = stats["size"];
                //var dateOf = new date();
                var storePhotos = new photoModel({
                  name: imageName,
                  title: fields.title,
                  price: fields.price,
                  user: users._id,
                  size: stats["size"],
                  width: dimensions.width,
                  height: dimensions.height,
                  date: new Date()
                });
                storePhotos.save(function(err, thor) {
                  if (err) return console.error(err);
                  console.dir(thor);
                });
              });
              imagemagick.resize({
                    srcPath: newPath,
                    dstPath: thumbPath,
                    width:   200
                  }, function(err, stdout, stderr){
                    if (err) console.log(err);
                    res.render('uploadPhoto',{msg:"cool image uploaded",imgSrc:imgPath});
                  });                
            });
          }
        });
    });
  });
  }
  
};

// build login page
exports.login = function(req, res){
  res.render('login', { title: 'login' });
};

//Build register page
exports.register = function(req, res){
  res.render('register', { msg: '' });
};

//Add registered user
exports.makeRegister = function(req, res){
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    var user = userInfo.findOne({username: req.body.username},
    function(err, users) {
      if (!users) {
        var hashPass = crypto.createHash("sha1").update(req.body.password).digest("hex");
          var registerUser = new userInfo({
            name: req.body.fullName,
            email: req.body.email,
            username: req.body.username,
            password: hashPass
          });
          registerUser.save(function(err, thor) {
            if (err) return console.error(err);
            console.dir(thor);
            req.login(registerUser, function (error) {
              if (error) { throw error; }
              res.redirect('/');
            });
          });
      }
      else {
        res.render('register', { msg: 'username is already taken' });
      }
    });
  });
  //res.render('register', { title: 'Express' });
};


//checkOut
exports.checkOut = function(req, res){
  if (req.session.passport.user === undefined) {
    res.redirect('/login');
  } else {
///////////////////////////////////

    var user = userInfo.findOne({username: req.session.passport.user},
    function(err, users) {
      carts.find({user: users._id})
      .populate('itemID')
      .populate('user')
      .exec(function (err, cart) {
      if (err) return console.error(err);
        cart.forEach(function(item){
          item.itemID.forEach(function(itemID){
            console.log(item._id);

            var addToOrder = new orders({
              itemID: itemID._id,
              user: users._id,
              date: new Date()
            });
            addToOrder.save(function(err, thor) {
             if (err) return console.error(err);
              carts.remove({ "_id": item._id }, function(err) {
                if (err) throw err;

              });
              console.dir(thor);
              var userMail = users.email;    // FETCHING USER'S EMAIL FROM DB
              // create reusable transport method (opens pool of SMTP connections)
              var smtpTransport = nodemailer.createTransport("SMTP",{
                  service: "Gmail",
                  auth: {
                      user: "arterenaTeam@gmail.com",
                      pass: "008720868"
                  }
              });

              // setup e-mail data with unicode symbols
              var mailOptions = {
                  from: "Arterena <aababtain@gmail.com>", // sender address
                  to: userMail, // list of receivers
                  subject: "Thanks for Buying a photo", // Subject line
                  text: "Your order is confirmed! \
                Thanks for your order, you can check out your profile at anytime to access your photo \
                Now you officially have a License to use the photo you have purchased \
              \
                Thanks for you business, we truly appreciate it\
                \
                Sincerely, Arterena Team", // plaintext body
                  html: "<h3>Your order is confirmed!</h3>\
              <p>Thanks for your order, you can check out your profile at anytime to access your photo</p>\
              <p>Now you officially have a License to use the photo you have purchased</p>\
              <p>\
              <p>Thanks for you business, we truly appreciate it</p>\
              <p>Sincerely, Arterena Team</p>", // html body

              }

              // send mail with defined transport object
              smtpTransport.sendMail(mailOptions, function(error, response){
                  if(error){
                      console.log(error);
                  }else{
                      console.log("Message sent: " + response.message);
                  }

                  // if you don't want to use this transport object anymore, uncomment following line
                  //smtpTransport.close(); // shut down the connection pool, no more messages
              });
              res.render('checkOut', {});
            });

          });
        });
      });
    });


//////////////////////////////////
  }
};

// add to cart module
exports.addToCart = function(req, res){
  if (req.session.passport.user === undefined) {
    res.redirect('/login');
  } else {
    //console.log(req.param("id"));
    var user = userInfo.findOne({username: req.session.passport.user},
      function(err, users) {
    if (err) return console.error(err);
        var addToCart = new carts({
        itemID: req.param("id"),
        user: users._id,
        date: new Date()
      });
      addToCart.save(function(err, thor) {
      if (err) return console.error(err);
      console.dir(thor);
      res.redirect('/cart');
      });
    });
  }
};

// show cart module
exports.cart = function(req, res){
  if (req.session.passport.user === undefined) {
  res.redirect('/login');
  } else {
    var total=0;
    var user = userInfo.findOne({username: req.session.passport.user},
    function(err, users) {
      carts.find({user: users._id})
      .populate('itemID')
      .populate('user')
      .exec(function (err, cart) {
      if (err) return console.error(err);
        var arr = new Array();
        var data = new Array();
        //console.log(cart);
        cart.forEach(function(item){
          item.itemID.forEach(function(itemID){
            arr.push(itemID);
            total += itemID.price;
          });
        });
        var sentData = {data: arr, total: total};
        console.log(sentData);
        res.render('cart', sentData);
      });
    });
  }
};

/// get Photos 
exports.getPhoto = function(req, res){
  if (req.session.passport.user === undefined) {
    res.redirect('/login');
  } else {
    //console.log(req.param("id"));
    var user = userInfo.findOne({username: req.session.passport.user},
      function(err, users) {
        if (err) return console.error(err);
      orders.find({user: users._id})
      .populate('itemID')
      .populate('user')
      .exec(function (err, order) {
      if (err) return console.error(err);
        var arr = new Array();
        order.forEach(function(item){
          item.itemID.forEach(function(itemID){
            arr.push(itemID.name);
          });
        });
        //console.log(arr.indexOf(req.param("name")));
          if (arr.indexOf(req.param("name")) != -1) { //
            var img = fs.readFileSync(path.normalize(__dirname + '../../public/images/orginal/' + req.param("name")));
            res.writeHead(200, {'Content-Type': 'image/jpeg' });
            res.end(img, 'binary');
            //console.log(req.param("name"));
          } else {
            res.redirect('/');
          }
      });
    });
  }
};