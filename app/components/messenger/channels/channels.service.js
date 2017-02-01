'use strict';

app.service('channelsService', [
  '$rootScope', '$http', '$q', '$log', 'socket', 'Channel', '$state',
  function ($rootScope, $http, $q, $log, socket, Channel, $state) {

    var self = this;

    self.channels = [];

    /**
     * @summary Socket listeners
     */

    socket.on('init', function (results) {
      self.channels = [];
      self.initChannelsCount = results.length;
      results.forEach(function (result) {
        var channel = createAndPushChannel(result);
        $rootScope.$emit('channel:new', channel);
      });
      $rootScope.$broadcast('channels:updated', 'init');
    });

    socket.on('channel:new', function (result) {
      createAndPushChannel(result.channel);
      $rootScope.$broadcast('channels:updated');
    });

    /**
     * @todo If the edited channel is the current one, change url.
     */
    socket.on('channel:edit', function (result) {
      $log.info('channel:edit', result);
      var channel = findChannelById(result.channel.id);
      channel.updateFromJson(result.channel);
      if (isCurrentChannel(channel)) {
        $state.transitionTo('messenger.messages', {
          slug: channel.slug
        });
      }
      $log.info('channels:', self.channels);
      $rootScope.$broadcast('channels:updated');
    });

    socket.on('channel:members:add', function (result) {
      $log.info('add member:', result);
      if (result.channel.type === Channel.TYPE.PRIVATE) {
        createAndPushChannel(result.channel);
        $rootScope.$broadcast('channels:updated');
      }
    });

    socket.on('channel:members:remove', function (result) {
      if (result.channel.type === Channel.TYPE.PRIVATE) {
        var channel = findChannelById(result.channel.id);
        channel.setIsRemoved();
        $rootScope.$broadcast('channels:updated');
      }
    });

    socket.on('file:lived', function (data) {
      var channel = findChannelById(data.channelId);
      channel.liveFileId = data.fileId;
      $rootScope.$broadcast('channels:updated');
    });

    /**
     * @summary Methods
     */

    function createAndPushChannel(data) {
      var channel = new Channel(data.name, data.slug, data.description,
        data.type, data.id, data.membersCount, null, data.memberId,
        data.liveFileId);
      if (channel.isDirect() && channel.isDirectExist()) {
        channel.changeNameAndSlugFromId();
        var fakeDirect = findChannelBySlug(channel.slug);
        if (fakeDirect) {
          fakeDirect.setValues(channel.name, channel.slug, channel.description,
            channel.type, channel.id, channel.membersCount, null, channel.memberId);
          return fakeDirect;
        }
      }
      self.channels.push(channel);
      return channel;
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

    function setCurrentChannelBySlug(slug) {
      if (!slug) {
        setCurrentChannel(null);
      } else {
        var channel = findChannelBySlug(slug);
        if (!channel) {
          setCurrentChannel(null);
        } else if (channel.isDirect() && !channel.isDirectExist()) {
          createDirect(channel.memberId)
            .then(function () {
              setCurrentChannel(channel);
            });
        } else {
          setCurrentChannel(channel);
        }
      }
    }

    function setCurrentChannel(channel) {
      self.currentChannel = channel;
      $rootScope.$broadcast('channel:changed');
    }

    function getCurrentChannel() {
      return self.currentChannel;
    }

    function createChannel(channel) {
      var deferred = $q.defer();

      socket.emit('channel:create', channel, function (res) {
        if (res.status) {
          deferred.resolve();
        } else {
          deferred.reject(res.message);
          $log.error('Create channel failed.', res.message);
        }
      });
      return deferred.promise;
    }

    function sendEditedChannel(channel) {
      var defer = $q.defer();
      socket.emit('channel:edit:details', channel, function (response) {
        if (response.status) {
          defer.resolve();
        }
        else {
          defer.reject(response.message);
        }
      });
      return defer.promise;
    }

    function addMembersToChannel(memberIds, channelId) {
      var defer = $q.defer();
      var data = {
        memberIds: memberIds,
        channelId: channelId
      };
      socket.emit('channel:members:add', data, function (response) {
        if (response.status)
          defer.resolve();
        else
          defer.reject();
      });
      return defer.promise;
    }

    function removeMemberFromChannel(data) {
      var defer = $q.defer();
      socket.emit('channel:members:remove', data, function (res) {
        if (res.status) {
          defer.resolve();
        }
        else
          defer.reject(res.message);
      });
      return defer.promise;
    }

    function createDirect(memberId) {
      var deferred = $q.defer();
      var data = {
        memberId: memberId
      };
      socket.emit('channel:direct:create', data, function (res) {
        if (res.status) {
          deferred.resolve();
        } else {
          deferred.reject();
          $log.error('Creating direct channel failed.', res.message);
        }
      });
      return deferred.promise;
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
      $rootScope.$broadcast('channels:updated');
    }

    function updateChannelLastDatetime(channelId, datetime) {
      var channel = findChannelById(channelId);
      channel.setLastDatetime(datetime);
      $rootScope.$broadcast('channels:updated');
    }

    function updateChannelLastSeen(channelId, lastSeenMessageId) {
      var channel = findChannelById(channelId);
      channel.setLastSeen(lastSeenMessageId);
      $rootScope.$broadcast('channels:updated');
    }

    function addIsTypingMemberByChannelId(channelId, memberId) {
      var channel = findChannelById(channelId);
      channel.addIsTypingMemberId(memberId);
      $rootScope.$broadcast('channels:updated');
    }

    function removeIsTypingMemberByChannelId(channelId, memberId) {
      var channel = findChannelById(channelId);
      channel.removeIsTypingMemberId(memberId);
      $rootScope.$broadcast('channels:updated');
    }

    function addMessagesPromise(promise) {
      if (!self.messagesPromise) {
        self.messagesPromise = [];
      }
      self.messagesPromise.push(promise);
      if (self.messagesPromise.length == self.initChannelsCount) {
        $q.all(self.messagesPromise).then(function () {
          $rootScope.isLoading = false;
        });
      }
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

    function isCurrentChannel(channel) {
      return (self.currentChannel.id === channel.id);
    }

    function anyChannelHasUnread() {
      for (var i = 0; i < self.channels.length; i++) {
        if (self.channels[i].hasUnread()) {
          return true;
        }
      }
      return false;
    }

    function getChannels() {
      return self.channels;
    }

    function getPublicsAndPrivates() {
      return self.channels.filter(function (channel) {
        return channel.isPublic() || channel.isPrivate();
      });
    }

    function getDirects() {
      return self.channels.filter(function (channel) {
        return channel.isDirect();
      });
    }

    /**
     * @summary Public API
     */

    return {
      getPublicsAndPrivates: getPublicsAndPrivates,
      getDirects: getDirects,
      getChannels: getChannels,
      anyChannelHasUnread: anyChannelHasUnread,
      findChannelById: findChannelById,
      findChannelBySlug: findChannelBySlug,
      setCurrentChannelBySlug: setCurrentChannelBySlug,
      getCurrentChannel: getCurrentChannel,
      createChannel: createChannel,
      sendEditedChannel: sendEditedChannel,
      addMembersToChannel: addMembersToChannel,
      removeMemberFromChannel: removeMemberFromChannel,
      updateChannelNotification: updateChannelNotification,
      updateChannelLastDatetime: updateChannelLastDatetime,
      updateChannelLastSeen: updateChannelLastSeen,
      addIsTypingMemberByChannelId: addIsTypingMemberByChannelId,
      removeIsTypingMemberByChannelId: removeIsTypingMemberByChannelId,
      addMessagesPromise: addMessagesPromise,
      getChannelMembers: getChannelMembers
    };
  }
]);
