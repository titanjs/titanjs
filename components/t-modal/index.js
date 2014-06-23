exports.create = function(model, dom) {
  var self = this;

  dom.addListener(document, 'keydown', function(e) {
    if (e.keyCode === 27) {  // Escape
      self.close('escape')
    }
  })
  // Listeners added inside of a component are removed when the
  // page is re-rendered client side

  // dom.addListener(document.documentElement, 'click', function(e) {
  //   if (toggle.contains(e.target) || menu.contains(e.target)) return
  //   model.set('open', false)
  // })
}

exports.show = function() {
  this.model.set('show', true)
}

exports.close = function(action) {
  var cancelled = this.emitCancellable('close', action)
  if (!cancelled) this.model.set('show', false)
  this.model.set('show', false)
}

exports._click = function(e) {
  var action = e.target.getAttribute('data-action')
  if (action) this.close(action)
}
