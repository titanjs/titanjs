var derby = require('derby');
var request = require('../request');
var methods = {};

module.exports = {
  call: call,
  _caller: _caller,
  methods: methods,
  register: register,
};

function register(name, fn) {
  methods[name] = fn;
}

function _caller(name, args, model, cb) {
  var m = methods[name];
  if (!m) {
    cb('Method not found');
    return;
  }
  var result = m(args, model);
  return cb(undefined, result);
}

function call(name, args, cb) {
  args = args || {};

  // Sever only
  if (derby.util.isServer || (process.env.NODE_ENV === 'test')) {
    // XXX get model and user
    var model;
    var user;
    _caller(name, args, model, cb);
  } else {
    var req = {
      name: name,
      args: args
    };
    request
      .post('/-/rpc')
      .send(req)
      .end(function(err, resp) {
        // HTTP error
        // TODO do more with HTTP codes
        if (err) {
          cb(err, resp);
        }
        var b = resp.body
        // error in processing the method
        if (b.err) {
          cb(b.err);
        } else {
          cb(undefined, b.resp);
        }
      });

  }
}
