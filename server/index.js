// Util imports
var derby = require('derby');
var express = require('express');
var parseUrl = require('url').parse;
var path = require('path');

// Express Middleware Imports
var expressSession = require('express-session');
var serveStatic = require('serve-static');
var compression = require('compression');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var highway = require('racer-highway');
var derbyLogin = require('derby-login');

module.exports = function (config, store, apps, middleware, publicDir, loginConfig, errorMiddleware, cb) {
  // Session
  // -------
  var ConnectStore, sessionStore;
  // If redis is running then use it for session store; it's much faster.
  if (config.get('redis.use')) {
    ConnectStore = require('connect-redis')(expressSession);
    sessionStore = new ConnectStore({host: config.get('redis.host'), 
      port: config.get('redis.port'), pass: config.get('redis.password')});
  } else {
    ConnectStore = require('connect-mongo')(expressSession);
    sessionStore = new ConnectStore({url: config.get('mongo.url')});
  }

  function addSettings(req, res, next) {
    var model = req.getModel();
    if (config.has('settings')) {
      for(var key in config.get('settings')) {
        model.set('_settings.' + key, config.get('settings.' + key));
      }
    }
    next();
  }

  var session = expressSession({
    secret: config.get('session.secret'),
    store: sessionStore,
    cookie: config.get('session.cookie'),
    saveUninitialized: true,
    resave: true
  });

  // Websockets + Browser Channels
  var handlers = highway(store.store, {session: session});


  // Error Middleware
  // ----------------
  if (!errorMiddleware) {
    var errorMiddleware = require('../apps/error');
  }


  var expressApp = express()
    // Gzip dynamically rendered content
    .use(compression())
    .use(serveStatic(publicDir))
    .use(store.store.modelMiddleware())
    .use(cookieParser())
    .use(bodyParser.json())
    .use(bodyParser.urlencoded({extended: true}));

  // Force SSL
  forceSSL = config.get('ssl.force');
  if (forceSSL) {
    var forceSSL = require('express-force-ssl');
    expressApp.use(forceSSL);
  }
  
  expressApp.use(session)
    .use(derbyLogin.middleware(store.store, loginConfig))
    .use(addSettings)
    .use(handlers.middleware);

  // File uploads
  expressApp.use('/-/api/files', require('../file')(store, config));
  // Image serving
  expressApp.use('/-/images', require('../image')(store, config));

  // Add additional Middleware
  if (middleware) {
    middleware.forEach(function(mw){
      expressApp.use(mw);
    });
  }

  // Add routes for each app
  apps.forEach(function(app){
    expressApp.use(app.router());
  });


  expressApp
    .all('*', function (req, res, next) { next('404: ' + req.url); })
    // Render Error pages 
    .use(errorMiddleware);

  cb(expressApp, handlers.upgrade);
};
