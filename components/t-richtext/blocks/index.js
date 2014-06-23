exports.setup = function(library) {
  library.view.fn('markdownable', {
    get: function(attr) {
      return attr;
    },
    set: function(input) {
      return [input];
    }
  });
};

exports.create = function(model, dom) {
  // var opts = {
  //   editor: document.getElementById('editor'),
  //   // 'class': 'pen',
  //   debug: false,
  //   stay: false,
  //   textarea: '<textarea name="content"></textarea>',
  //   list: [
  //     'blockquote', 'h2', 'h3', 'p', 'insertorderedlist', 'insertunorderedlist',
  //     'indent', 'outdent', 'bold', 'italic', 'underline', 'createlink'
  //   ]
  // };
  // var editor = new Pen(opts);
  // make pasted text match the contenteditable
  // $('[contenteditable]').on('paste', function (e) {
  //   e.preventDefault()
  //   var text = (e.originalEvent || e).clipboardData.getData('text/plain')
  //   document.execCommand('insertText', false, text)
  // })
}
