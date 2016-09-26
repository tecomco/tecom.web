'use strict';

app.service('channelsService', ['$q', 'socket', function ($q, socket) {

  var deferred = $q.defer();

  socket.on('init', function (data) {
    deferred.resolve(data);
  });

  return {
    getChannels: function () {
      return deferred.promise;
    }
  };
}]);
