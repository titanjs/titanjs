var config = {
  ns: 'admin'
, filename: __filename
, styles: '../../styles/ui'
, scripts: {
    ui: require('./ui')
  , imageViewer: require('./imageViewer')
  , section: require('./section')
  }
};

module.exports = function(app, options) {
  app.createLibrary(config, options);
};
