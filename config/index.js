var convict = require('convict');
var path = require('path');
var url = require('url');
var check = require('convict/node_modules/validator').check

module.exports = function config(options, cb) {
  options = options || {}
  envAlias('MONGOHQ_URL', 'MONGO_URL');
  envAlias('MONGOLAB_URL', 'MONGO_URL');

  envAlias('OPENREDIS_URL', 'REDIS_URL');
  envAlias('REDISTOGO_URL', 'REDIS_URL');
  envAlias('REDISCLOUD_URL', 'REDIS_URL');

  var config = convict({
    env: {
      doc: 'The application environment',
      format: [
        'development',
        'test',
        'production'
      ],
      default: 'development',
      env: 'NODE_ENV'
    },
    port: {
      doc: 'The ipv4 address to bind.',
      format: 'port',
      default: 3000,
      env: 'PORT'
    },
    ip: {
      doc: 'The ipv4 address to bind.',
      format: 'ipaddress',
      default: '0.0.0.0',
      env: 'IP'
    },
    static: {
      doc: 'The folders express.static should serve.',
      format: mountPoints,
      default: path.resolve('public')
    },
    ssl: {
      key: {
        doc: 'The path to your ssl key file.',
        format: String,
        default: '',
        env: 'SSL_KEY'
      },
      cert: {
        doc: 'The path to your ssl cert file.',
        format: String,
        default: '',
        env: 'SSL_CERT'
      },
      passphrase: {
        doc: 'The ssl passphrase',
        format: String,
        default: '',
        env: 'SSL_PASSPHRASE'
      }
    },
    mongo: {
      url: {
        format: mongoUrl,
        default: undefined,
        env: 'MONGO_URL',
        arg: 'mongo-url' // eg. $ npm start --mongo-url "mongodb://127.0.0.1:27017/whatever"
      },
      host: {
        format: String,
        default: 'localhost',
        env: 'MONGO_HOST'
      },
      port: {
        format: 'port',
        default: 27017,
        env: 'MONGO_PORT'
      },
      db: {
        format: String,
        default: undefined,
        env: 'MONGO_DB'
      },
      opts: {
        safe: {
          format: Boolean,
          default: true,
          env: 'MONGO_SAFE'
        }
      }
    },
    redis: {
      use: {
        format: Boolean,
        default: false,
        env: 'REDIS_USE'
      },
      url: {
        // format: mongoUrl,
        format: String,
        default: undefined,
        env: 'REDIS_URL',
        arg: 'redis-url' // eg. $ npm start --redis-url
      },
      host: {
        format: String,
        default: 'localhost',
        env: 'REDIS_HOST'
      },
      port: {
        format: 'port',
        default: 6379,
        env: 'REDIS_PORT'
      },
      db: {
        format: String,
        default: undefined,
        env: 'REDIS_DB'
      },
      password: {
        format: String,
        default: undefined,
        env: 'REDIS_PASSWORD'
      }
    },
    session: {
      secret: {
        doc: 'Secret used to sign the session',
        format: secret(16),
        default: undefined,
        env: 'SESSION_SECRET'
      },
      cookie: {
        doc: 'Secret used to sign the cookie',
        format: secret(16),
        default: undefined,
        env: 'SESSION_COOKIE'
      }
    },
    mailer: {
      defaultEmail: {
        format: String,
        default: 'First Last <test@example.com>',
        env: 'MAILER_DEFAULT_EMAIL'
      },
      transport: {
        type: {
          format: String,
          default: 'SMTP',
          env: 'MAILER_TRANSPORT_TYPE'
        },
        options: {
          service: {
            format: String,
            default: "gmail",
            env: 'MAILER_TRANSPORT_SERVICE'
          },
          auth: {
            user: {
              format: String,
              default: "test@example.com",
              env: 'MAILER_AUTH_USER'
            },
            pass: {
              format: String,
              default: "Passsword",
              env: 'MAILER_AUTH_PASSWORD'
            }
          }
        }
      }
    },
    settings: {
      format: Object,
      default: {},
      env: 'PUBLIC_SETTINGS'
    }
  });

  options.forEach(function(opts){
    config.load(opts);
  });

  if (config.has('mongo.url') === false) setMongoUrl(config);
  if (cb) cb(null, config);

  config.validate();
  return config;
}

function setMongoUrl(config) {
  var m = config.get('mongo');
  config.set('mongo.url', 'mongodb://' + m.host + ':' + m.port + '/' + m.db);
}

function secret(length) {
  return function (val) {
    check(val).notEmpty().len(length);
  }
}

function optionalSecret(length) {
  return function (val) {
    if (!!val) secret(length)(val);
  }
}

function checkUrl(protocol, attributes) {
  return function (val) {
    var u = url.parse(val);
    check(u.protocol, 'Wrong protocol.').equals(protocol)
    attributes.forEach(function (attr) {
      check(u[attr]).notEmpty()
    })
  }
}

function mongoUrl(val) {
  checkUrl('mongodb:', ['hostname','port','path'])(val)
}

function envAlias(source, target) {
  if (process.env[source]) process.env[target] = process.env[source];
}

function mountPoints(val) {
  if (Array.isArray(val)) {
    val.forEach(function (el) {
      check(el.route).contains('/');
      check(el.dir).notEmpty();
    })
  } else {
    check(val).notEmpty();
  }
}

