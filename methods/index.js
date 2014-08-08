var derby = require('derby');

exports.methods = methods = {};

exports.register = function(name, fn) {
  methods[name] = fn;
};

exports.call = function(name, args, callback) {
  // Client only
  if (!derby.util.isServer) {
    var xhr = require('xhr');
    args = args || {};

    req = {
      method: name,
      args: args
    }
    xhr({
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      uri: '/-/rpc',
      json: req
    }, function (err, resp, body) {
      // TODO do more with status codes
      // console.log("resp.statusCode", resp.statusCode);
      
      // error in the transmission, i.e. 404 500
      if (err) {
        callback(err, resp);
      }
      // error in processing the method
      if (resp.err) {
        callback(resp.err);
      } else {
        callback(null, resp.msg);
      };
    })

  } else {
    console.log("methods: called on server");
    // methods[name].call()
  }
};
