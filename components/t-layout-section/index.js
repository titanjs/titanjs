var moments = require('moment');

module.exports = LayoutSection;
function LayoutSection() {}
LayoutSection.prototype.name = 't-bs-layout-section';
LayoutSection.prototype.view = __dirname;

LayoutSection.prototype.create = function(model, dom) {
  this.model.set('limit', 20);
  this.model.set('viewType', 'table');
}

LayoutSection.prototype.delete = function(e, el, next) {
  // var self = this;
  // var id = e.target.getAttribute('data-id');
  // var modelType = e.target.getAttribute('data-model-type');
  // debugger;
  var remove = window.confirm("Are you sure you want to remove this documents? This action can not be un-done.");
  if (remove === true) {
    e.at().remove();
    // self.model.del(modelType.toLowerCase() + '.' + id, function(err) {
    toastr.success('Document deleted successfully');
    // });
  }
}

LayoutSection.prototype.formatDate = function(date) {
  if (!date)  return '';
  return moment(date, ["YYYY.MM.DD"]);
}

LayoutSection.prototype.timeSince = function(date) {
  return moment(date).fromNow();
}

LayoutSection.prototype._click = function(e) {
  var action = e.target.getAttribute('data-action');
  if (action) {
    if (action === 'select') {
      var url = e.target.getAttribute('src');
      if (url) {
        this.model.set('activeurl', url.split('/convert')[0]);
      }
    } else {
      this.model.set('viewType', action);
    }
  }
}
