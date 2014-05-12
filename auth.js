var passport = require('passport');
var LocalStrategy = require('passport-local');
var mongoose = require('mongoose');
var crypto = require('crypto');

var Schema = mongoose.Schema;
var UserDetail = new Schema({
      username: String,
      password: String
    }, {
      collection: 'userInfo'
    });
var UserDetails = mongoose.model('users', UserDetail);


passport.use(new LocalStrategy(function(username, password, done) {
  process.nextTick(function() {
  	var hashPass = crypto.createHash("sha1").update(password).digest("hex");
    UserDetails.findOne({
      'username': username, 
    }, function(err, user) {
      if (err) {
        return done(err);
      }
 
      if (!user) {
        return done(null, false);
      }
 
      if (user.password != hashPass) {
        return done(null, false);
      }
 
      return done(null, user);
    });
  });
}));
/*passport.use(new LocalStrategy(
	function(username, password, done) {
		if (username === 'admin' && password === 'admin') {
			return done(null, {username: 'admin'});
		} else {
			return done(null, false);
		}
	}
	)
);*/

/*passport.serializeUser(function(user, done) {
	console.log(user);
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});*/

passport.serializeUser(function(user, done){
	console.log(user);
	done(null, user.username);

});
passport.deserializeUser(function(user, done){
	done(null, user);
});

module.exports = passport;