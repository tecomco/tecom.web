'use strict';

app.service('channelsService', ['$http', '$q', '$log', 'socket',
  function ($http, $q, $log, socket) {

    var deferredInit = $q.defer();
    var deferredNewChannel = $q.defer();

    socket.on('init', function (data) {
      $log.info('Socket opened and connection established successfuly.');
      deferredInit.resolve(data);
    });

    socket.on('channel:new', function (data) {
      deferredNewChannel.resolve(data);
      $log.info('new channel promise : ');
      $log.info(deferredNewChannel.promise);
    });

    return {
      getChannels: function () {
        return deferredInit.promise;
      },
      sendNewChannel: function (data, callback) {
        socket.emit('channel:create', data, callback);
      },
      getTeamMembers: function (teamId) {
        var defferedTeamMember = $q.defer();
        $http({method: 'GET', url: '/api/v1/teams/'+teamId+'/members/'}).
          success(function(data, status, headers, config){
            defferedTeamMember.resolve(data);
        }).
          error(function(data, status, headers, config){
            defferedTeamMember.reject(status);
        });
        return defferedTeamMember.promise;
      }
    };
  }
]);
