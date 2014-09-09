var liveDbMongo = require('livedb-mongo');
var mongo = require('mongoskin');

var liveDbMongo = require('livedb-mongo');
var coffeeify = require('coffeeify');

module.exports = store;

function store(derby, schemas, config) {

  derby.use(require('racer-bundle'));
  // if (schemas) { derby.use(require('racer-schema'), schemas); }

  // console.log("config.get('mongo.url'): ", config.get('mongo.url'));

  // LiveDb Options
  // --------------
  // MongoDb
  // -------
  var skin = mongo.db(config.get('mongo.url') + '?auto_reconnect', { safe: true });
  var liveDb = liveDbMongo(skin);

  var opts = { db: liveDb };
  var redisClient;

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
    opts.redis = redisClient;
  }
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
    browserify.pack = function(options) {
      var detectTransform = options.globalTransform.shift();
      options.globalTransform.push(detectTransform);
      return pack.apply(this, arguments);
    };
  });

  // Exports
  // -------
  return {
    store: store,
    liveDbMongo: liveDb,
    mongo: skin,
    redis: redisClient,
  };
}
