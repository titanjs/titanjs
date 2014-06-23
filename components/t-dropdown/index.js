module.exports = Dropdown;
function Dropdown() {}
Dropdown.prototype.view = __dirname;

Dropdown.prototype.create = function(model, dom) {
  // Close on click outside of the dropdown
  var dropdown = this;
  dom.on('click', function(e) {
    if (dropdown.toggleButton.contains(e.target)) return;
    if (dropdown.menu.contains(e.target)) return;
    model.set('open', false);
  });
};

Dropdown.prototype.toggle = function() {
  this.model.set('open', !this.model.get('open'));
};

Dropdown.prototype.select = function(option) {
  this.model.set('value', optionValue(option));
  this.model.set('open', false);
};

Dropdown.prototype.label = function(value) {
  var options = this.model.get('options') || [];
  for (var i = 0, len = options.length; i < len; i++) {
    var option = options[i];
    if (value === optionValue(option)) {
      return option.content;
    }
  }
  return this.model.get('prompt') || 'Select';
};

function optionValue(option) {
  return (option.hasOwnProperty('value')) ? option.value : option.content;
}


// module.exports = Dropdown;
// function Dropdown() {}
// Dropdown.prototype.name = 't-favicons';
// Dropdown.prototype.view = __dirname;

// // The create function is called after the component is created
// // and has been added to the DOM. It only runs in the browser
// Dropdown.prototype.create = function(model, dom) {
//   var toggle = dom.element('toggle')
//     , menu = dom.element('menu')

//   // Make sure the value gets set to the default if unselected
//   updateValue(model, model.get('value'), true)

//   // Listeners added inside of a component are removed when the
//   // page is re-rendered client side
//   dom.addListener(document.documentElement, 'click', function(e) {
//     if (toggle.contains(e.target) || menu.contains(e.target)) return
//     model.set('open', false)
//   })
// }

// // The init function is called on both the server and browser
// // before rendering
// Dropdown.prototype.init = function(model) {
//   updateValue(model, model.get('value'))

//   model.on('change', 'value', function(value) {
//     updateValue(model, value, true)
//   })
// }

// Dropdown.prototype.toggle = function() {
//   this.model.set('open', !this.model.get('open'))
// }

// Dropdown.prototype._clickOption = function(e) {
//   this.model.set('open', false)
//   var item = e.get()
//   if (!item) return
//   var value = (item.value === void 0) ? item.text : item.value
//   this.model.set('value', value)
// }

// function optionValue(option) {
//   return ('value' in option) ? option.value : option.text
// }

// function updateValue(model, value, setValue) {
//   var options = model.get('options')
//     , i, len, option
//   if (!options) return
//   for (i = 0, len = options.length; i < len; i++) {
//     option = options[i]
//     if (optionValue(option) !== value) continue
//     model.set('label', option.text)
//     return
//   }
//   option = options[0]
//   value = optionValue(option)
//   if (setValue || value === void 0) {
//     model.set('value', value)
//   }
//   model.set('label', option.text)
// }
