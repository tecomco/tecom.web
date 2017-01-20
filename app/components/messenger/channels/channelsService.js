'use strict';

app.service('channelsService',
  ['$rootScope', '$http', '$q', '$log', 'socket', 'messagesService', 'Channel', 'User', 'arrayUtil',
  function ($rootScope, $http, $q, $log, socket, messagesService, Channel, User, arrayUtil) {

    var self = this;

    self.channels = [];

    /**
     * @todo Call `MessagesService` method for each channel.
     */
    socket.on('init', function (results) {
      results.forEach(function (result) {
        createAndPushChannel(result);
      });
      messagesService.getNewMessagesFromServer(self.channels);
      $rootScope.$broadcast('channel');
    });

    socket.on('channel:new', function (result) {
      createAndPushChannel(result);
      $rootScope.$broadcast('channel');
    });

    socket.on('channel:edit', function (result) {
      var channel = findChannelById(result.id);
      channel.setValues(result.name, result.slug, result.description,
        result.type, result.id, result.membersCount);
      $rootScope.$broadcast('channel');
    });

    socket.on('channel:members:add', function (result) {
      createAndPushChannel(result);
      $rootScope.$broadcast('channel');
    });

    socket.on('channel:members:remove', function (result) {
      if (result.channel.type === Channel.TYPE.PRIVATE) {
        var channel = findChannelById(result.id);
        channel.setIsRemoved();
        $rootScope.$broadcast('channel');
      }
    });

    function createAndPushChannel(data) {
      var channel = new Channel(data.name, data.slug,
        data.description, data.type, data.id, data.membersCount);
      channel.memberId = data.memberId;
      if (channel.isDirect() && channel.isDirectExist()) {
        channel.changeNameAndSlugFromId();
        var fakeDirect = findChannelBySlug(channel.slug);
        if (fakeDirect) {
          fakeDirect = channel;
          return;
        }
      }
      self.channels.push(channel);
    }

    function findChannelById(id) {
      return self.channels.find(function (channel) {
        return channel.id === id;
      });
    }

    function findChannelBySlug(slug) {
      return self.channels.find(function (channel) {
        return channel.slug === slug;
      });
    }

    function createChannel(channel) {
      socket.emit('channel:create', channel);
    }

    function editChannel(channel) {
      socket.emit('channel:edit:details', channel);
    }

    function addMembersToChannel(memberIds, channelId) {
      var data = {
        memberIds: memberIds,
        channelId: channelId
      };
      socket.emit('channel:members:add', data);
    }

    function removeMembersFromChannel(data) {
      socket.emit('channel:members:remove', data);
    }

    function createNewDirect(memberId) {
      var data = {
        memberId: memberId
      };
      socket.emit('channel:direct:create', data);
    }

    function updateChannelNotification(channelId, type, notifCount) {
      var channel = findChannelById(channelId);
      switch (type) {
        case 'empty':
          channel.notifCount = 0;
          break;
        case 'inc':
          channel.notifCount++;
          break;
        case 'num':
          channel.notifCount = notifCount;
          break;
      }
      $rootScope.$broadcast('channel');
    }

    function updateChannelLastDatetime(channelId, datetime) {
      var channel = findChannelById(channelId);
      channel.lastDatetime = datetime;
      $rootScope.$broadcast('channel');
    }

    /**
     * @todo Put this method in correct module.
     */
    function getTeamMembers(teamId) {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/api/v1/teams/' + teamId + '/members/'
      }).success(function (data) {
        var members = data;
        arrayUtil.removeElementByKeyValue(members, 'id', User.id);
        deferred.resolve(members);
      }).error(function (err) {
        $log.info('Error Getting team members.', err);
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function getChannelMembers(channelId) {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/api/v1/messenger/channels/' + channelId + '/details/'
      }).success(function (data) {
        deferred.resolve(data);
      }).error(function (err) {
        $log.info('Error Getting channel members.', err);
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function isPublicOrPrivate(value) {
      return value.isPublic() || value.isPrivate();
    }

    function isDirect(value) {
      return value.isDirect();
    }

    function getChannels() {
      return self.channels;
    }

    function getPublicsAndPrivates() {
      return self.channel.filter(isPublicOrPrivate);
    }

    function getDirects() {
      return self.channel.filter(isDirect);
    }

    return {
      getPublicsAndPrivates: getPublicsAndPrivates,
      getDirects: getDirects,
      createChannel: createChannel,
      editChannel: editChannel,
      addMembersToChannel: addMembersToChannel,
      removeMembersFromChannel: removeMembersFromChannel,
      createNewDirect: createNewDirect,
      getTeamMembers: getTeamMembers,
      getChannelMembers: getChannelMembers
    };
  }
]);
