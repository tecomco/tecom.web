'use strict';

app.factory('socket', ['$rootScope', 'ENV', function ($rootScope, ENV) {
  // TODO: Choose a better approach :/
  if (ENV.name === 'ui') {
    return {
      on: function () {},
      emit: function () {}
    };
  }
  var socket = io.connect(ENV.socketUri, {
    path: '/ws/',
    query: {
      username: 'test_user',
      memberId: window.memberId
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
