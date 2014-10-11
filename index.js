require('coffee-script/register');

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

  derby.run(function(){
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
      
      obj.apps.forEach(function(app){
        app.writeScripts(store.store, publicDir, {extensions: ['.coffee']}, function(){
          console.log('Bundle created:', chalk.yellow(app.name));
        });
      });

      // Create secure server if SSL is configured
      var sslCert = config.get('ssl.cert');
      var sslKey = config.get('ssl.key');
      if (sslCert && sslKey) {
        var sslPassphrase = config.get('ssl.passphrase');
        var https = require('https');
        var fs = require('fs');
        var c = {
          key: fs.readFileSync(sslKey),
          cert: fs.readFileSync(sslCert)
        };
        if (sslPassphrase) {
          c.passphrase = sslPassphrase;
        }
        var secureServer = https.createServer(c, expressApp);
        secureServer.on('upgrade', upgrade);
        var securePort = 443;
        if (config.get('env') === 'development') {
          // Bind to higer port in development 
          var securePort = port;
          // Bump the port number by one for http traffic, so that we don't have an error
          port = port + 1;
        }
        secureServer.listen(securePort, function() {
          console.log('%d listening. Go to: https://localhost:%d/', process.pid, securePort);
        });
      }

      var server = http.createServer(expressApp);
      server.on('upgrade', upgrade);

      // Add 'hook' and 'onQuery' functions to the store 
      derbyHook(store.store);

      server.listen(port, function() {
        console.log('%d listening. Go to: http://localhost:%d/', process.pid, port);
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
