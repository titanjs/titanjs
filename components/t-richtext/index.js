var config = {
  ns: 'richtext'
, filename: __filename
, styles: '../../styles/ui'
, scripts: {
    richtext: require('./richtext')
  }
};

module.exports = function(app, options) {
  app.createLibrary(config, options);
};
