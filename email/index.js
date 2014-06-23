var conf = require('../config')
var nodemailer = require('nodemailer');


// Set default config options, useful for testing
conf.defaults({
  "mailer": {
    "defaultFromAddress": "First Last <test@example.com>",
    "transport": {
      "type": 'SMTP',
      "options": {
        "service": "gmail",
        "auth": {
          "user": "test@example.com",
          "pass": "Passsword"
        }
      }
    }
  }
});

var RecipientRequiredError = new Error('one of the followings is required: to, cc or bcc');

var prettyMessage = function(opts) {
  var msg = '' +
    '\n////////////////////////////////////////////////////////////////////' +
    '\n/////////////////////////// Message Sent ///////////////////////////' +
    '\n////////////////////////////////////////////////////////////////////' +
    '\n' +
    '\nFROM: ' + opts.from +
    '\nTO: ' + opts.to +
    '\nCC: ' + opts.cc +
    '\nBCC: ' + opts.bcc +
    '\nREPLY TO: ' + opts.replyTo +
    '\nSUBJECT: ' + opts.subject +
    '\n' + 
    '\n--------------------------------TEXT--------------------------------' +
    '\n' +
    '\n' + opts.text +
    '\n' + 
    '\n--------------------------------HTML--------------------------------' +
    '\n' +
    '\n' + opts.html +
    '\n';
  return msg;
};


// Options:
//
//  RFC5322 "From:" address (required)
//
//  to String or Array of strings
//  RFC5322 "To:" address[es]
//
//  cc String or Array of strings
//  RFC5322 "Cc:" address[es]
//
//  bcc String or Array of strings
//  RFC5322 "Bcc:" address[es]
//
//  replyTo String or Array of strings
//  RFC5322 "Reply-To:" address[es]
//
//  subject String
//  RFC5322 "Subject:" line
//
//  text String
//  RFC5322 mail body (plain text)
//
//  html String
//  RFC5322 mail body (HTML)
//
//  headers Object
//  RFC5322 custom headers (dictionary)
//  
exports.send = function(opts, callback) {
  var c = conf.get('email');
  opts = opts || {};
  if (!opts.to || !opts.cc || !opts.bcc) return callback(RecipientRequiredError)

  // If a from address is not given then use the default from
  opts.from = opts.from || c.defaultFromAddress;

  // Log the message to the console during development and debug mode
  if (conf.get('NODE_ENV') === 'development' || conf.get('NODE_ENV') === 'debug') {
    console.log(prettyMessage(opts));
  }

  // only send real email on production or when debugging
  if (conf.get('NODE_ENV') === 'production' || conf.get('NODE_ENV') === 'debug') {
    var transport = nodemailer.createTransport(c.transport.type, c.transport.options);
    transport.sendMail(opts, function(err, responseStatus) {
      if (err) {
        console.log("titan-email: There was an error sending message: ", err);
        console.log("opts: ", opts);
        return callback(err);
      }
      callback(null, responseStatus.message, opts.html, opts.text);
      return;
    });
  }
  // if we are developing or testing don't send out an email instead return
  // success and the html and txt strings for inspection. And log to console.
  callback(null, '250 2.0.0 OK 1350452502 s5sm19782310obo.10', opts.html, opts.text);
};
