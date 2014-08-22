module.exports = HerokuKeepAlive;
function HerokuKeepAlive() {}
HerokuKeepAlive.prototype.name = 't-heroku-keep-alive';
HerokuKeepAlive.prototype.view = __dirname;
HerokuKeepAlive.prototype.create = function() {
  // TODO make duration configurable
  var d = this.model.get('duration');
  var model = this.app.model;
  var duration;
  if (d) {
    duration = parseFloat(d) || 30000;
  } else {
    duration = 30000;
  }
  var duration = this.model.get('duration') || 30000;
  var ping = function() {
    var time = new Date().getTime();
    model.root.channel.send('ping', time, function(msg) {
       // console.log(msg);
    });
  };
  // We only want one timer running, so we will use a global.
  // I tried using HerokuKeepAlive.prototype.destroy instead, but the timers
  // weren't being removed
  if (typeof window._heroku_keep_alive_timer == 'number') {
  } else {
    window._heroku_keep_alive_timer = window.setInterval(ping, duration);
  }
};
