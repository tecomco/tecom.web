'use strict';

app.factory('socket', [
  '$rootScope', '$log', 'ENV', '$uibModal', 'domainUtil', 'AuthService', 'User',
  function ($rootScope, $log, ENV, $uibModal, domainUtil, AuthService, User) {

    var self = this;

    var teamSlug = domainUtil.getSubdomain();

    var socketUri = teamSlug ? teamSlug + '.' + ENV.socketUri : ENV.socketUri;

    self.socket = io.connect(socketUri, {
      path: '/ws/',
      query: {
        token: User.token,
        teamSlug: teamSlug
      },
      extraHeaders: {
        Connection: 'keep-alive'
      }
    });

    self.socket.on('connect', function () {
      $log.info('Socket opened and connection established successfuly.');
      $rootScope.socketConnected = true;
    });

    self.socket.on('disconnect', function () {
      $log.error('Socket disconnected.');
      $rootScope.socketConnected = false;
    });

    self.socket.on('err', function (err) {
      $log.info('Error On Socket :', err);
      if (err.name === 'TokenExpiredError' && User.exists()) {
        $log.info('Token refresh started.');
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
