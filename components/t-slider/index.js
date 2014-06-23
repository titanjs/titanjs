module.exports = Slider;
var _ = require('lodash');

function Slider(){};
Slider.prototype.name = "slider";
Slider.prototype.view = __dirname;

Slider.prototype.toListOfList = function(r) {
  var all = [];
  if (r) {
    var count = 0;
    var length = r.length; 
    var group = [];
    var i = 0
    while (i < length) {
      // Start over after if count equals 2
      if (count === 2) {
        all.push(group);
        count = 0;
        group = [];
      }
      group.push(r[i]);
      i++;
      count++;
    }
    if (group) { all.push(group); }
  }
  return all;
};

Slider.prototype.init = function(model) {
  var f = model.data.featured;
  var q = model.data.query;
  if (q && q.length) {
    if (f === true) {
      model.set('first', q.shift());
      if (q) {
        model.set('rest', this.toListOfList(q))
      }
    } else {
      model.set('all', q);
    }
  }
}

Slider.prototype.create = function(model, dom) {
  require('../../public/bower_components/sly/dist/sly.min');
  $(".slider-frame").each(function() {
    var $wrap, el;
    el = $(this);
    $wrap = el.parent();
    el.sly({
      horizontal: 1,
      itemNav: "basic",
      smart: 0,
      scrollSource: null,
      scrollBy: 0,
      mouseDragging: 1,
      touchDragging: 1,
      releaseSwing: 1,
      startAt: 0,
      scrollBar: $wrap.find(".scrollbar"),
      activatePageOn: "click",
      speed: 300,
      elasticBounds: 1,
      dragHandle: 1,
      dynamicHandle: 1,
      clickBar: 1
    });
    $(window).resize(function() {
      el.sly("reload");
    });
  });
};
