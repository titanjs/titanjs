require('coffee-script/register');

var http  = require('http');
var derby = require('derby');
var express = require('./server');
var chalk = require('chalk');
var path = require('path');

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
    // Defaults to the root/public of application
    var publicDir = obj.publicDir || process.cwd() + '/public';

    express(config, store, obj.apps, middleware, publicDir, obj.loginConfig, obj.errorMiddleware, function(expressApp, upgrade){
      var server = http.createServer(expressApp);

      server.on('upgrade', upgrade);

      server.listen(port, function() {
        console.log('%d listening. Go to: http://localhost:%d/', process.pid, port);
      });

      obj.apps.forEach(function(app){
        app.writeScripts(store.store, publicDir, {extensions: ['.coffee']}, function(){
          console.log('Bundle created:', chalk.yellow(app.name));
        });
      });

      callback(null, store, config, expressApp, upgrade)
    });
  });
}

exports.run = run;
