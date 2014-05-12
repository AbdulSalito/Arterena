/*
######## MongoDB schemas ############
*/

var mongoose = require('mongoose');

//var db = mongoose.connection;
var userSchema = mongoose.Schema({
  name: String,
  username: String,
  password: String,
  email: String
}, {
	collection: 'userInfo'
}
);

module.exports = mongoose.model('userInfo', userSchema);

var photoShema = mongoose.Schema({
  name: String,
  title: String,
  price: Number,
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userInfo' }],
  size: Number,
  width: String,
  height: String,
  date: Date
}, {
      collection: 'photomodels'
    });

module.exports = mongoose.model('photoModel', photoShema);

var cartShema = mongoose.Schema({
  //[{ type: mongoose.Schema.Types.ObjectId, ref: 'photoModel' }]
  itemID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'photoModel' }],
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userInfo' }],
  date: String
  } , {
      collection: 'carts'
});

module.exports = mongoose.model('carts', cartShema);

var orderSchema = mongoose.Schema({
  //[{ type: mongoose.Schema.Types.ObjectId, ref: 'photoModel' }]
  itemID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'photoModel' }],
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userInfo' }],
  date: String
  } , {
      collection: 'orders'
});

module.exports = mongoose.model('orders', orderSchema);
