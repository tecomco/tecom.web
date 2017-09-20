'use strict';

app.factory('socket', [
  '$rootScope', '$log', 'ENV', '$uibModal', 'domainUtil', '$localStorage',
  function ($rootScope, $log, ENV, $uibModal, domainUtil, $localStorage) {

    var self = this;

    var teamSlug = domainUtil.getSubdomain();
    $localStorage.token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpbWFnZSI6Ii9tZWRpYS8yMDE3LzA4L1U1NS81NS5wbmciLCJ1c2VyX2lkIjo1NSwiZXhwIjoxNTA4NDc5NjgyLCJ1c2VybmFtZSI6ImFtaXJob3NzZWluIiwib3JpZ19pYXQiOjE1MDU4ODc2ODIsImVtYWlsIjoiYW1pcmhvc3NlaW5AdGVjb21zLm1lIiwibWVtYmVyc2hpcHMiOlt7ImlzX2FkbWluIjp0cnVlLCJpZCI6ODksInRlYW1fc2x1ZyI6InRlY29tLWJvaSIsInRlYW1faWQiOjY5fV19.rai-AslvB-ZJvJOx9h8ULMUIvnpKDrPbQjDPrZCkx8A";    

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
      $rootScope.$broadcast('socket:connected');
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
