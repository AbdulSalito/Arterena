var mongoose = require('mongoose');


var photoShema = mongoose.Schema({
  name: String,
  user: [{ type: mongoose.Schema.Types.ObjectId, ref: 'userInfo' }],
  size: Number,
  width: String,
  height: String,
  date: Date, {
      collection: 'photomodels'
    }
});

module.exports = mongoose.model('photoModel', photoShema);