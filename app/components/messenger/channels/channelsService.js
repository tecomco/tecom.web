'use strict';

app.service('channelsService', ['$http', '$q', '$log', 'socket',
  'messagesService', 'Channel', 'User', 'arrayUtil',
  function ($http, $q, $log, socket, messagesService, Channel, User, arrayUtil) {

    var self = this;
    self.deferredInit = $q.defer();
    self.deferredNewChannel = $q.defer();
    self.deferredEditedChannel = $q.defer();

    socket.on('init', function (data) {
      var channels = [];
      $log.info('Init channels:', data);
      data.forEach(function (channel) {
        var tmpChannel = new Channel(channel.name, channel.slug,
          channel.description, channel.type, channel.id, channel.membersCount);
        if (channel.memberId)
          tmpChannel.memberId = channel.memberId;
        channels.push(tmpChannel);
      });
      self.deferredInit.resolve(channels);
      messagesService.getNewMessagesFromServer(channels);
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
      var deferredTeamMembers = $q.defer();
      $http({
        method: 'GET',
        url: '/api/v1/teams/' + teamId + '/members/'
      }).success(function (data) {
        var members = data;
        arrayUtil.removeElementByKeyValue(members, 'id', User.id);
        deferredTeamMembers.resolve(members);
      }).error(function (err) {
        $log.info('Error Getting team members:', err);
      });
      return deferredTeamMembers.promise;
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

    var sendAddeMembersToChannel = function (data, callback) {
      socket.emit('channel:members:add', data, callback);
    };
    var getEditedChannel = function () {
      self.deferredEditedChannel = $q.defer();
      return self.deferredEditedChannel.promise;
    };

    var setUpdateNotificationCallback = function (updateFunc) {
      self.updateNotification = updateFunc;
    };

    var updateNotification = function (channelId, changeType, notifCount) {
      self.updateNotification(channelId, changeType, notifCount);
    };

    var setUpdateLastDatetimeCallback = function (updateFunc) {
      self.updateLastDatetimeCallback = updateFunc;
    };

    var updateLastDatetime = function (channelId, datetime) {
      self.updateLastDatetimeCallback(channelId, datetime);
    };

    var setUpdateLastDatetimeCallback = function (updateFunc) {
      self.updateLastDatetimeCallback = updateFunc;
    };

    var setFindChannelCallback = function (findChannelFunc) {
      self.findChannelCallback = findChannelFunc;
    };

    var findChannel = function (channelId) {
      return self.findChannelCallback(channelId);
    };

    var removeMemberFromChannel = function (data, callback) {
      socket.emit('channel:members:remove', data, callback);
    };

    var createNewDirectRequest = function (memberId, username, callback) {
      var data = {memberId: memberId, username: username};
      socket.emit('channel:direct:create', data, callback);
    };

    return {
      getInitChannels: getInitChannels,
      sendNewChannel: sendNewChannel,
      getNewChannel: getNewChannel,
      getTeamMembers: getTeamMembers,
      getChannelMembers: getChannelMembers,
      sendDetailsEditedChannel: sendDetailsEditedChannel,
      sendAddeMembersToChannel: sendAddeMembersToChannel,
      getEditedChannel: getEditedChannel,
      setUpdateNotificationCallback: setUpdateNotificationCallback,
      updateNotification: updateNotification,
      setUpdateLastDatetimeCallback: setUpdateLastDatetimeCallback,
      updateLastDatetime: updateLastDatetime,
      setFindChannelCallback: setFindChannelCallback,
      findChannel: findChannel,
      removeMemberFromChannel: removeMemberFromChannel,
      createNewDirectRequest: createNewDirectRequest
    };
  }
])
;
