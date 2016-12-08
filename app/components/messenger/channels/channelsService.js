'use strict';

app.service('channelsService', ['$http', '$q', '$log', 'socket',
  'messagesService', 'Channel',
  function ($http, $q, $log, socket, messagesService, Channel) {

    var self = this;
    self.deferredInit = $q.defer();
    self.deferredNewChannel = $q.defer();
    self.deferredEditedChannel = $q.defer();

    socket.on('init', function (data) {
      var channels = [];
      angular.forEach(data, function (channel) {
        var tmpChannel = new Channel(channel.name, channel.slug,
          channel.description, channel.type, channel.id, channel.membersCont,
          null, null, null);
        channels.push(tmpChannel);
        self.deferredInit.resolve(channels);
        messagesService.getNewMessagesFromServer(tmpChannel);
      });
    });

    socket.on('channel:new', function (data) {
      self.deferredNewChannel.resolve(data);
    });

    socket.on('channel:edit', function (data) {
      self.deferredEditedChannel.resolve(data);
    });

    var getInitChannels = function () {
      self.deferredInit = $q.defer();
      return self.deferredInit.promise;
    };

    var sendNewChannel = function (data, callback) {
      socket.emit('channel:create', data, callback);
    };

    var getNewChannel = function () {
      self.deferredNewChannel = $q.defer();
      return self.deferredNewChannel.promise;
    };
    var getTeamMembers = function (teamId) {
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
    };
    var getChannelMembers = function (channelId) {
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
    };
    var sendDetailsEditedChannel = function (channel, callback) {
      socket.emit('channel:edit:details', channel, callback);
    };
    var getEditedChannel = function () {
      self.deferredEditedChannel = $q.defer();
      return self.deferredEditedChannel.promise;
    };

    return {
      getInitChannels: getInitChannels,
      sendNewChannel: sendNewChannel,
      getNewChannel: getNewChannel,
      getTeamMembers: getTeamMembers,
      getChannelMembers: getChannelMembers,
      sendDetailsEditedChannel: sendDetailsEditedChannel,
      getEditedChannel: getEditedChannel
    };
  }
]);
