'use strict';

app.service('channelsService', ['$q', '$log', 'socket',
  function ($q, $log, socket) {

    var deferred = $q.defer();

    /*socket.on('init', function (data) {
      $log.info('Socket opened and connection established successfuly.');
      deferred.resolve(data);
    });*/

    return {
      getChannels: function () {
        return deferred.promise;
      },
      sendNewChannel: function (data, callback) {
        socket.emit('channel:create', data, callback);
      }
    };
  }
]);
