'use strict';

app.factory('socket', [
  '$rootScope', '$log', 'ENV', '$uibModal', 'domainUtil', '$localStorage',
  function ($rootScope, $log, ENV, $uibModal, domainUtil, $localStorage) {

    var self = this;

    var teamSlug = domainUtil.getSubdomain();
    $localStorage.token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJtZW1iZXJzaGlwcyI6W3sidGVhbV9zbHVnIjoidGVjb20yIiwiaXNfYWRtaW4iOnRydWUsInRlYW1faWQiOjEsImlkIjoxN30seyJ0ZWFtX3NsdWciOiJ0ZXN0IiwiaXNfYWRtaW4iOnRydWUsInRlYW1faWQiOjcsImlkIjozM30seyJ0ZWFtX3NsdWciOiJ0ZWNvbXRlc3QiLCJpc19hZG1pbiI6dHJ1ZSwidGVhbV9pZCI6MTAsImlkIjo0Nn0seyJ0ZWFtX3NsdWciOiJhbWlyaG9zc2VpbiIsImlzX2FkbWluIjp0cnVlLCJ0ZWFtX2lkIjoxMSwiaWQiOjgyfSx7InRlYW1fc2x1ZyI6ImZpcmVmb3h0ZXN0IiwiaXNfYWRtaW4iOnRydWUsInRlYW1faWQiOjEyLCJpZCI6ODR9XSwidXNlcl9pZCI6MTEsImVtYWlsIjoiYW1pcmFob3NzZWluYW1lbGlAZ21haWwuY29tIiwib3JpZ19pYXQiOjE1MDU2NTY0NTUsInVzZXJuYW1lIjoiXHUwNjI3XHUwNjQ1XHUwNmNjXHUwNjMxXHUwNjJkXHUwNjMzXHUwNmNjXHUwNjQ2IiwiaW1hZ2UiOiIvbWVkaWEvMjAxNy8wNC8xMS8xMS5qcGciLCJleHAiOjE1MDgyNDg0NTV9.vkOLAWI0EtzbYQ6S7No3RUvhGOd-5X_XkCd-4IZVBWc";    

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
