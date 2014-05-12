var mongoose = require('mongoose');


var cartShema = mongoose.Schema({
  //[{ type: mongoose.Schema.Types.ObjectId, ref: 'photoModel' }]
  itemID: [{ type: mongoose.Schema.Types.ObjectId, ref: 'photoModel' }],
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userInfo' }],
  date: String , {
      collection: 'carts'
    }
});

module.exports = mongoose.model('carts', cartShema);
