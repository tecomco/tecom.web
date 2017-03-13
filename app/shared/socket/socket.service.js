'use strict';

app.factory('socket', [
  '$rootScope', '$log', 'ENV', '$uibModal', 'domainUtil', '$localStorage',
  function ($rootScope, $log, ENV, $uibModal, domainUtil, $localStorage) {

    var self = this;

    var teamSlug = domainUtil.getSubdomain();

    self.socket = io.connect(ENV.socketUri, {
      path: '/',
      query: {
        token: $localStorage.token,
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
