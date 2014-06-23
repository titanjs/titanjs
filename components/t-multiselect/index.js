var _ = require('lodash');

exports.setup = function(library) {
  library.view.fn('contains', function(list, value) {
    return _.contains(list, value)
  });
};

// The create function is called after the component is created
// and has been added to the DOM. It only runs in the browser
exports.create = function(model, dom) {
  var toggle = dom.element('toggle'),
    menu = dom.element('menu')
    
    var v = model.get('values');
    if (!v || !v.length) model.set('values', []);

    // Make sure the value gets set to the default if unselected
    updateValue(model, model.get('values'), true)

    // Listeners added inside of a component are removed when the
    // page is re-rendered client side
    dom.addListener(document.documentElement, 'click', function(e) {
      if (toggle.contains(e.target) || menu.contains(e.target)) return
      model.set('open', false)
    })
}

// The init function is called on both the server and browser
// before rendering
exports.init = function(model) {
  updateValue(model, model.get('values'))

  model.on('change', 'values', function(value) {
    updateValue(model, value, true)
  })
}

exports.toggle = function() {
  this.model.set('open', !this.model.get('open'))
}

exports._clickOption = function(e) {
  // this.model.set('open', false)
  var item = e.get()
  if (!item) return
  var value = (item.value === void 0) ? item.text : item.value
  var list = this.model.get('values')
  // if the value is in the list remove it
  var found = _.find(list, function(v) {
    return v == value;
  });
  var newList;
  if (found) {
    newList = _.without(list, value);
  } else {
    _.uniq(list.push(value));
    newList = list;
  }
  this.model.set('values', newList);
}

function optionValue(option) {
  return ('value' in option) ? option.value : option.text
}
// app.view.fn('join', {
//   get: function(arr) {
//     return [].concat(arr).join(', ');
//   },
//   set: function(input) {
//     var arr = _.map(input.split(','), function(x) {
//       return x.trim();
//     });
//     return [arr]
//   }
// });
function updateValue(model, value, setValue) {
  var label;

  if (!value || !value.length) {
    label = 'None selected';
  } else if (value && value.length > 3) {
    label = value.length + ' selected';
  } else {
    label = [].concat(value).join(', ');
  }
  model.set('label', label)
  // var options = model.get('options'),
  //   i, len, option
  // if (!options) return
  // for (i = 0, len = options.length; i < len; i++) {
  //   option = options[i]
  //   if (optionValue(option) !== value) continue
  //   console.log("if for value: ", value);
  //   model.set('label', value)
  //   return
  // }
  // option = options[0]
  // value = optionValue(option)
  // if (setValue || value === void 0) {
  //   model.set('values', value)
  // }
  // model.set('label', value)
  // model.set('label', option.text)
}
