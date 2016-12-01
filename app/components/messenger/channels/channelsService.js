'use strict';

app.service('channelsService', ['$http', '$q', '$log', 'socket',
  'messagesService',
  function ($http, $q, $log, socket, messagesService) {

    var self = this;
    self.deferredInit = $q.defer();
    self.deferredNewChannel = $q.defer();
    self.deferredEditedChannel = $q.defer();

    socket.on('init', function (data) {
      self.deferredInit.resolve(data);
      angular.forEach(data, function (channel) {
        messagesService.getUnreadMessagesFromServer(channel.id);
      });
    });

    socket.on('channel:new', function (data) {
      self.deferredNewChannel.resolve(data);
    });

    socket.on('channel:edit', function (data) {
      self.deferredEditedChannel.resolve(data);
    });

    return {
      getInitChannels: function () {
        self.deferredInit = $q.defer();
        return self.deferredInit.promise;
      },
      sendNewChannel: function (data, callback) {
        socket.emit('channel:create', data, callback);
      },
      getNewChannel: function () {
        self.deferredNewChannel = $q.defer();
        return self.deferredNewChannel.promise;
      },
      getTeamMembers: function (teamId) {
        self.defferedTeamMembers = $q.defer();
        $http({
          method: 'GET',
          url: '/api/v1/teams/' + teamId + '/members/'
        }).success(function (data, status, headers, config) {
          self.defferedTeamMembers.resolve(data);
        }).error(function (data, status, headers, config) {
          self.defferedTeamMembers.reject(status);
        });
        return self.defferedTeamMembers.promise;
      },
      getChannelMembers: function (channelId) {
        self.defferedChannelMembers = $q.defer();
        $http({
          method: 'GET',
          url: '/api/v1/messenger/channels/' + channelId + '/details/'
        }).success(function (data, status, headers, config) {
          self.defferedChannelMembers.resolve(data);
        }).error(function (data, status, headers, config) {
          self.defferedChannelMembers.reject(status);
        });
        return self.defferedChannelMembers.promise;
      },
      sendDetailsEditedChannel: function (channel, callback) {
        socket.emit('channel:edit:details', channel, callback);
      },
      getEditedChannel: function () {
        self.deferredEditedChannel = $q.defer();
        return self.deferredEditedChannel.promise;
      }
    };
  }
]);
