'use strict';

app.factory('socket', [
  '$rootScope', '$log', 'ENV', '$uibModal', 'AuthService', 'User',
  function ($rootScope, $log, ENV, $uibModal, AuthService, User) {

    var self = this;

    if (!User.exists()) {
      var modalInstance = $uibModal.open({
        templateUrl: 'login.html',
        controller: 'loginController',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function (username) {
        AuthService.login(username + '@gmail.com', 'test123', function (res) {
          if (res) {
            window.location.reload();
          }
        });
      }, function () {});
      return {
        on: function () {},
        emit: function () {}
      };
    }

    // TODO: Choose a better approach :/
    if (ENV.name === 'ui') {
      return {
        on: function () {},
        emit: function () {}
      };
    }

    self.socket = io.connect(ENV.socketUri, {
      path: '/ws/',
      query: {
        token: User.token
      },
      extraHeaders: {
        Connection: 'keep-alive'
      }
    });

    self.socket.on('err', function (err) {
      $log.info('Error On Socket :', err);
      if (err.name === 'TokenExpiredError' && User.exists()) {
        AuthService.refreshToken(User.token);
      }
    });

    return {
      on: function (eventName, callback) {
        self.socket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(self.socket, args);
          });
        });
      },
      emit: function (eventName, data, callback) {
        self.socket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(self.socket, args);
            }
          });
        });
      }
    };
  }
]);

app.controller('loginController', function ($uibModalInstance) {

  var $ctrl = this;

  $ctrl.login = function () {
    if ($ctrl.forms.login.username.$valid) {
      $uibModalInstance.close($ctrl.username);
    }
  };

  $ctrl.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
});
