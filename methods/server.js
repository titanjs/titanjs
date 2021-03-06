var express = require('express');
var client = require('./index');


function _caller(name, args, model, cb) {
  var m = client.methods[name];
  if (!m) {
    cb('Method not found');
    return;
  }
  var result = m(args, model, cb);
}

module.exports = function(store, conf) {
  var e = express.Router();
  
  var rpc = function(req, res, next) {
    // TOOD Add user lookup
    // The current user should be passed to the method making it easy
    // to check authorization
    req.accepts('json');
    var r = req.body;
    var model = req.getModel();
    _caller(r.name, r.args, model, function(err, resp) {
      return res.send({err: err, resp: resp});
    });
  };

  e.post('/', rpc);
  return e;
};
