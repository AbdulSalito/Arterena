
/*

MODULE NAME			: EMAIL.JS
FUNCTION			: IMPLEMENTS FUNCTIONALITY OF SENDING INVITATION TO A FRIEND
				  
CHANGE DETAILS
		NAME		: PUNIT SHARMA
		DATE		: 5/1/2014
		CHANGE-1	: DEVELOPED INITIAL VERSION
		
*/

// NODE MODULE TO SEND EMAIL

var nodemailer = require('nodemailer');

exports.sendEmail = function(req, res){
	var userMail = req.body.email;    // FETCHING USER'S EMAIL TO SEND INVITATION
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
	//res.redirect();
};