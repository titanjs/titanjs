var mongo = require('mongoskin/node_modules/mongodb');
var gridform = require('gridform');
var Grid = require('gridfs-stream');
var fs = require('fs');
var _ = require('lodash');

var store = require('../store');
var gridfs;


exports.routes = function(app, store, conf) {
  app.post('/-/api/files', putfile);
};

store.mongo.open(function(err, db) {
  gridfs = Grid(db, mongo);
  gridform.db = db;
  gridform.mongo = mongo;
  if (!err) {
    // console.log('database connected');
  } else {
    // console.log('database connection error', err);
  }
});

// in your http server
var putfile = function(req, res) {
  var form = gridform();

  form.type = 'multipart';

  form.on('fileBegin', function(name, file) {
    // file.metadata = '';
  })
  form.on('field', function(name, value) {});
  form.on('file', function(name, value) {});
  form.on('error', function(name, value) {});
  form.addListener('end', function() {});
  form.on('end', function(err, fields, files) {});
  form.on('aborted', function(err, fields, files) {});
  form.on('progress', function(bytesReceived, bytesExpected) {})
  
  form.parse(req, function(err, fields, files) {
    var f = files.file
    f.id = f._id = f.id
    model = req.getModel();
    model.set("images." + f.id, f);
    res.send(f);
  });
};

