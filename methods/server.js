var methods = require('./index').methods;

exports.routes = function(app, store, conf) {
  app.all('/-/rpc', rpc);
};

var rpc = function(req, res, next) {
  // TOOD Add user lookup
  // The current user should be passed to the method making it easy
  // to check authorization
  req.accepts('json');
  var r = req.body;
  // find the method
  var m = methods[r.method];
  // console.log("m: ", m);
  var obj = {
    err: null,
    msg: ''
  };
  if (!m) {
    obj.err = 'Method not found';
    return res.send(obj);
  }
  m(r.args, function(err, resp){
    // TODO validate return
    return res.send({err: err, msg: resp});
  });
};
