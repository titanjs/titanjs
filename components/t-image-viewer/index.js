exports.create = function(model, dom) {
  this.model.set('viewType', 'upload');
}

exports.delete = function(e, el, next) {
  var remove = window.confirm("Are you sure you want to remove this image? This action can not be un-done.");
  if (remove === true) {
    e.at().remove();
    toastr.success('Image deleted successfully');
  }
}

var uploadFile = function(file) {
  var formData = new FormData();
  var xhr = new XMLHttpRequest();

  formData.append('file', file);

  var updateProgress = function(e) {
    console.log("updateProgress");
    console.log("e: ", e);
    if (e.lengthComputable) {
      var percentComplete = (e.loaded/e.total)*100;
      console.log("percentComplete: ", percentComplete);
    }
  };

  var onReady = function(e) {
    console.log("onReady");
    console.log("e: ", e);
  };

  var transferFailed = function(err) {
    console.log("err: ", err);
    // something went wrong with upload
  };

  var transferComplete = function(e) {
    console.log("transferComplete");
    console.log("arguments: ", arguments);
    console.log("e: ", e);
    console.log("xhr.response: ", xhr.response);
    // update the images
  };

  var transferCanceled = function(e) {
    console.log("transferCanceled");
    console.log("e: ", e);
   // ready state
  };

  var uploadUrl = '/-/api/files'
  xhr.open("POST", uploadUrl, true);
  xhr.addEventListener('progress', updateProgress, false);
  xhr.addEventListener('error', transferFailed, false);
  xhr.addEventListener("load", transferComplete, false);
  xhr.addEventListener("abort", transferCanceled, false);
  xhr.addEventListener('readystatechange', onReady, false);
  xhr.send(formData);
};

exports._drop = function(e) {
  e.stopPropagation();
  e.preventDefault();

  this.model.set('active', false);
  var self = this;
  var files = e.dataTransfer.files; // FileList object.
  // files is a FileList of File objects. List some properties.
  for (var i = 0, f; f = files[i]; i++) {
    uploadFile(f);
  }
};

exports._dragleave = function() {
  this.model.set('active', false);
};

exports._dragover = function(e) {
  e.stopPropagation();
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  this.model.set('active', true);
};

exports._sudoFileInputClick = function() {
  document.getElementById("files").click();
};

exports._click = function(e) {
  var action = e.target.getAttribute('data-action')
  if (action) {
    if (action === 'select') {
      var id = e.target.getAttribute('data-id');
      if (id) {
        // XXX this must be lowercase, not sure why?
        this.model.set('selected-image-id', id)
      }
    } else {
      this.model.set('viewType', action)
    }
  }
}
