/*
######## MongoDB schemas ############
*/

var mongoose = require('mongoose');

//var db = mongoose.connection;
var userSchema = mongoose.Schema({
  name: String,
  username: String,
  password: Number,
  email: String
  , {
      collection: 'userInfo'
    }

});

module.exports = mongoose.model('userInfo', userSchema);