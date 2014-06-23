var config = require('../config')();
var derby = require('derby');
var coffeeify = require('coffeeify');

var liveDbMongo = require('livedb-mongo');
var mongo = require('mongoskin');
var redisClient;

// MongoDb
// -------
var skin = mongo.db(config.get('mongo.url') + '?auto_reconnect', {
  safe: true
});
var db = liveDbMongo(skin);

var opts = {
  db: db,
};

// Redis
// -----
// Configure opts to include Redis if it's running.
if (config.get('redis.use')) {
  var redis = require('redis');
  var redisClient = redis.createClient(config.get('redis.port'), 
    config.get('redis.host'));
  // Set the password
  if (config.get('redis.password')) {
    redisClient.auth(config.get('redis.password'));
  }
  // Set the db
  redisClient.select(config.get('redis.db') || 1);
  opts.redis = redisClient
}


// Create Store
// ------------
var store = derby.createStore(opts);

// Create Store
// ------------
store.on('bundle', function(browserify) {
  // Add support for directly requiring coffeescript in browserify bundles
  browserify.transform({global: true}, coffeeify);

  // HACK: In order to use non-complied coffee node modules, we register it
  // as a global transform. However, the coffeeify transform needs to happen
  // before the include-globals transform that browserify hard adds as the
  // first trasform. This moves the first transform to the end as a total
  // hack to get around this
  var pack = browserify.pack;
  browserify.pack = function(opts) {
    var detectTransform = opts.globalTransform.shift();
    opts.globalTransform.push(detectTransform);
    return pack.apply(this, arguments);
  };
});


// Exports
// -------
module.exports.db = db;
module.exports.redis = redisClient;
module.exports.mongo = skin;
module.exports.store = store;
