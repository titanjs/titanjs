// Util imports
var derby = require('derby');
var express = require('express');
var parseUrl = require('url').parse;
var path = require('path')

// Express Middleware Imports
var session = require('express-session');
var cookieParser = require('cookie-parser');
var serveStatic = require('serve-static');
var compression = require('compression');
var favicon = require('serve-favicon');

var racerBrowserChannel = require('racer-browserchannel');

// Local imports
// -------------
// Middleware
var errorMiddleware = require('../apps/error');

var file = require('../file');
var image = require('../image');
// Config
var config = require('../config')();
// The store creates models and syncs data
var store = require('../store').store;


derby.use(require('racer-bundle'));

var connectStore, sessionStore;
// If redis is running then use it for session store; it's much faster.
if (config.get('redis.use')) {
  connectStore = require('connect-redis')(session);
  sessionStore = new connectStore({host: config.get('redis.host'), 
    port: config.get('redis.port'), pass: config.get('redis.password')});
} else {
  connectStore = require('connect-mongo')(session);
  sessionStore = new connectStore({url: config.get('mongo.url')});
}

exports.setup = setup;

function setup(app, conf, cb) {

  var publicDir = config.get('static') || path.join(__dirname, '/../../public');

  var expressApp = express()
    .use(favicon(path.join(publicDir, '/favicon.ico')))
    // Gzip dynamically rendered content
    .use(compression());

  if (Array.isArray(publicDir)) {
    for (var i = 0; i < publicDir.length; i++) {
      var o = publicDir[i];
      expressApp.use(o.route, serveStatic(o.dir));
    }
  } else {
    expressApp.use(serveStatic(publicDir));
  }

  expressApp
    .use(cookieParser())
    .use(session({
      secret: config.get('session.secret'),
      store: sessionStore
    }));

  // Add browserchannel client-side scripts to model bundles created by store,
  // and return middleware for responding to remote client messages
  expressApp
    .use(racerBrowserChannel(store))
    // Adds req.getModel method
    .use(store.modelMiddleware())
    .use(createUserId);

  // Creates an express middleware from the app's routes
  expressApp.use(app.router());

  file.routes(expressApp);
  image.routes(expressApp);

  expressApp.all('*', function(req, res, next) {
    next('404: ' + req.url);
  });

  // Render Error pages 
  expressApp.use(errorMiddleware);

  app.writeScripts(store, publicDir, {extensions: ['.coffee']}, function(err) {
    cb(err, expressApp);
  });
}

function createUserId(req, res, next) {
  var model = req.getModel();
  var userId = req.session.userId;
  if (!userId) userId = req.session.userId = model.id();
  model.set('_session.userId', userId);
  next();
}

