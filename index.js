require('coffee-script/register');
require('log-timestamp')(function() { return  chalk.gray(new Date().toISOString()) + ' %s'});

var async = require('async');
var derby = require('derby');
var express = require('./server');
var chalk = require('chalk');
var http = require('http');
var derbyHook = require('derby-hook');

// var path = require('path');

// obj:
//   - apps
//     Array of apps to include
//   - middleware
//     Additional Middleware to be added. Maybe used for routes
//   - schemas (optional)
//     Object - E.g.
//       {
//         schemas: {
//           products: {
//             properties: {
//               name: {type: 'string', minLength: 6},
//               price: {type: 'integer', minimum: 0}
//             },
//             required: ['name']
//           }
//         }
//       }
//   - config (optional)
//     Object - default config options
//   - publicDir (optional)
//     XXX should the be moved to config?
//     path to public directory.
//   - loginConfig (optional)
//     XXX should the be moved to config?
//     config for authentication
//   - errorMiddleware (optional)
//     function - custom middleware for handling errors
// callback:
//   TODO: solidify API
//   - function - (err, store, config, expressApp, upgrade)
function run(obj, callback) {

  derby.run(function() {
    var config = require('./config')(obj.config);
    var store = require('./store')(derby, obj.schemas, config);
    var port = config.get('port');
    var ip = config.get('ip');
    var middleware = obj.middleware || [];

    if (obj.methods) {
      var methods = require('./methods');
      Object.keys(obj.methods).forEach(function (key) {
        methods.register(key, obj.methods[key]);
      });
    }

    // Defaults to the root/public of application
    var publicDir = obj.publicDir || process.cwd() + '/public';

    express(config, store, obj.apps, middleware, publicDir, obj.loginConfig, obj.errorMiddleware, function(expressApp, upgrade){

      async.each(obj.apps, bundleApp, function() {});

      function bundleApp(app, cb) {
        app.writeScripts(store.store, publicDir, {extensions: ['.coffee']}, function(err){
          if (err) {
            console.log('Bundle not created:', chalk.red(app.name), ', error:', err);
          } else {
            console.log('Bundle created:', chalk.blue(app.name));
          }
          cb();
        });
      }

      var server = http.createServer(expressApp);
      server.on('upgrade', upgrade);

      // Add 'hook' and 'onQuery' functions to the store 
      derbyHook(store.store);

      server.listen(port, function() {
        console.log('%d listening. Go to: ' + chalk.yellow('http://localhost:%d/'), process.pid, port);
      });

      store.store.on('client', function(client) {
        // Register useful rpc handler

        // ping
        // ----
        client.channel.on('ping', function(start, cb) {
          var end = new Date().getTime();
          cb('ping duration: ' + (end - start));
        });
      });
 
      callback(undefined, store, config, expressApp, upgrade);
    });
  });
}

exports.run = run;
