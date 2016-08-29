'use strict';

app.factory('socket', ['$rootScope', 'ENV', function ($rootScope, ENV) {
  var socket = io.connect(ENV.socketUri, {
    query: {
      username: 'mohsen',
      memberId: '1'
    }
  });
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      });
    }
  };
}]);
