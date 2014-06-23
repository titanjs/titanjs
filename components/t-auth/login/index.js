
exports.init = function(model) {};

exports.create = function(model, dom) {};

exports.usernameBlur = function() {
  var $q, model, rootModel;
  model = this.model;
  rootModel = model.parent().parent();
  $q = rootModel.query('auths', {
    'local.username': model.get('username'),
    $limit: 1
  });
  return $q.fetch(function(err) {
    try {
      if (err) {
        throw new Error(err);
      }
      if ($q.get()[0]) {
        return model.set('errors.username', '');
      } else {
        throw new Error("Username not registered. Make sure you're using the same capitalization you used to register!");
      }
    } catch (_error) {
      err = _error;
      return model.set('errors.username', err.message);
    }
  });
};

exports.loginSubmit = function(e, el) {};

exports.showPasswordReset = function() {
  return document.getElementById('derby-auth-password-reset').style.display = "";
};

exports.submitPasswordReset = function() {
  var model = this.model;
  var rootModel = model.parent().parent();
  var $q = rootModel.query('auths', {
    'local.email': model.get('passwordResetEmail'),
    $limit: 1
  });
  return $q.fetch(function(err) {
    try {
      if (err) {
        throw new Error(err);
      }
      if (!$q.get()[0]) {
        throw new Error('Email not registered.');
      } else {
        model.set('errors.passwordReset', '');
        return typeof $ !== "undefined" && $ !== null ? $.ajax({
          type: 'POST',
          url: "/password-reset",
          data: {
            email: model.get('passwordResetEmail')
          },
          success: function(response) {
            return model.set('success.passwordReset', response);
          },
          error: function(e) {
            console.log(e);
            throw e.responseText;
          }
        }) : void 0;
      }
    } catch (_error) {
      err = _error;
      return model.set('errors.passwordReset', err.message);
    }
  });
};
