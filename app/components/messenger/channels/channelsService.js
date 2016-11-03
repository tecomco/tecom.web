'use strict';

app.service('channelsService', ['$http', '$q', '$log', 'socket',
  function ($http, $q, $log, socket) {

    var deferredInit = $q.defer();
    var deferredNewChannel = $q.defer();
    //var deferredDetailsEditedChannel = $q.defer();

    socket.on('init', function (data) {
      $log.info('Socket opened and connection established successfuly.');
      deferredInit.resolve(data);
    });

    socket.on('channel:new', function (data) {
      deferredNewChannel.resolve(data);
    });

    /*socket.on('channel:edit:details', function (data) {
     deferredDetailsEditedChannel.resolve(data);
     });*/

    return {
      getChannels: function () {
        return deferredInit.promise;
      },
      sendNewChannel: function (data, callback) {
        socket.emit('channel:create', data, callback);
      },
      getNewChannel: function () {
        return deferredNewChannel.promise;
      },
      getTeamMembers: function (teamId) {
        var defferedTeamMembers = $q.defer();
        $http({
          method: 'GET',
          url: '/api/v1/teams/' + teamId + '/members/'
        }).success(function (data, status, headers, config) {
          defferedTeamMembers.resolve(data);
        }).error(function (data, status, headers, config) {
          defferedTeamMembers.reject(status);
        });
        return defferedTeamMembers.promise;
      },
      getChannelMembers: function (channelId) {
        var defferedChannelMembers = $q.defer();
        $http({
          method: 'GET',
          url: '/api/v1/messenger/channels/' + channelId + '/details/'
        }).success(function (data, status, headers, config) {
          defferedChannelMembers.resolve(data);
        }).error(function (data, status, headers, config) {
          defferedChannelMembers.reject(status);
        });
        return defferedChannelMembers.promise;
      },
      sendDetailsEditedChannel: function (channel, callback) {
        $log.info("Emit");
        socket.emit('channel:edit:details', channel, callback);
      }
    };
  }
]);
