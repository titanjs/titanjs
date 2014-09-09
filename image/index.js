// We must use the mongodb module from mongoskin.
// If we attempt to install it as a root module there will undoubtedly 
// a version conflict.
var mongo = require('mongoskin/node_modules/mongodb');
var express = require('express');
var Grid = require('gridfs-stream');
var store = require('../store');
var gm = require('gm').subClass({
  imageMagick: true
});
var gridfs;

// Constants
var MAX_AGE = 31536000;

module.exports = function(store, conf) {
  var e = express.Router();

  store.mongo.open(function(err, db) {
    // XXX might break things. Test.
    gridfs = new Grid(db, mongo);
    if (!err) {
      // console.log('database connected');
    } else {
      // console.log('database connection error', err);
    }
  });

  var imagesRoute = function(req, res, next) {
    var url = req.params[0];
    var filename = '';
    // XXX
    // TODO use regex for this?
    // if doesn't end with '/' then get the file name
    var parts = url.split('/');
    // remove '' (empty)
    parts.shift();
    var id = parts.shift();
    var filename = parts.pop();
    var commands = parts.join('/');
    var cmds = commands.split('-/');

    // read file, buffering data as we go
    var readStream = gridfs.createReadStream({
      _id: id
    });

    // error handling, e.g. file does not exist
    readStream.on('error', function(err) {
      console.log('file read error: ', err);
      // set the headers back to normal
      res.setHeader('Cache-Control', 'public, max-age=0');
      // res.setHeader('Expires', new Date(Date.now() + 1));
      res.setHeader('Content-Type', 'text/html');
      next('404: ' + req.url);
    });

    var base = gm(readStream);

    var gMap = function(key) {
      var g = {
        'northwest': 'NorthWest',
        'north': 'North',
        'northeast': 'NorthEast',
        'west': 'West',
        'center': 'Center',
        'east': 'East',
        'southwest': 'SouthWest',
        'south': 'South',
        'southeast': 'SouthEast'
      };
      return g[key.toLowerCase()] || 'NorthWest';
    };

    for (var i = 0; i < cmds.length; i++) {
      if (!cmds[i]) continue;
      var c = cmds[i].split('/');
      // Append a ^ to the geometry so that the image is resized while 
      // maintaining the aspect ratio of the image, but the resulting width or 
      // height are treated as minimum values rather than maximum values.
      switch (c[0]) {
      case 'scale_crop':
        var a = c[1].split('x');
        base.gravity(gMap(c[2]));
        base.resize(parseInt(a[0], 10), parseInt(a[1], 10), '^');
        base.crop(parseInt(a[0], 10), parseInt(a[1], 10));
        break;
      case 'resize':
        var a = c[1].split('x');
        var w = null;
        var h = null;
        if (a[0]) w = parseInt(a[0], 10);
        if (a[1]) h = parseInt(a[1], 10);
        // base.resize(w, h, '^');
        base.resize(w, h);
        break;
      default:
        console.log('default');
      }
    }
    // base.mode('JPEG');
    // base.compress('JPEG');

    // var mimeType = 'png'
    // base.format(function(err, value){
    //   mimeType = value.toLowerCase();
    // });

    base.stream('jpeg', function(err, stdout, stderr) {
      if (err) return next(err);
      // res.setHeader('Expires', new Date(Date.now() + 604800000));
      res.setHeader('Cache-Control', 'public, max-age=' + MAX_AGE);
      res.setHeader('Content-Type', 'image/jpeg');
      // TODO: Use a created date from the image if available. 
      res.setHeader('Last-Modified', new Date());
      stdout.pipe(res);
    });
  };

  e.all('*', imagesRoute);

  return e;
};
