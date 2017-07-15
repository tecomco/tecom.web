'use strict';

app.service('channelsService', [
  '$rootScope', '$http', '$q', '$log', 'socket', 'Channel', '$state',
  'CurrentMember', 'Team', 'ArrayUtil',
  function ($rootScope, $http, $q, $log, socket, Channel, $state,
    CurrentMember, Team, ArrayUtil) {

    var self = this;

    /**
     * @summary Global variables
     */

    self.channels = [];
    self.initialChannelsGottenForFirstTime = false;

    initialize();

    /**
     * @summary Socket listeners
     */

    socket.on('channel:new', function (result) {
      var channel = createAndPushChannel(result.channel);
      if (result.channel.creatorId === CurrentMember.member.id) {
        $state.go('messenger.messages', {
          slug: channel.getUrlifiedSlug()
        });
      }
      $rootScope.$broadcast('channels:updated');
    });

    /**
     * @todo If the edited channel is the current one, change url.
     */
    socket.on('channel:edit', function (result) {
      var channel = findChannelById(result.channel.id);
      var isChannelSelected = channel.isSelected();
      channel.updateFromJson(result.channel);
      if (isChannelSelected) {
        $state.go('messenger.messages', {
          slug: channel.slug
        });
      }
      $rootScope.$broadcast('channels:updated');
    });

    socket.on('channel:members:add', function (result) {
      $log.info('add member:', result);
      var channel = findChannelById(result.channel.id);
      if (result.channel.type === Channel.TYPE.PUBLIC)
        channel.isCurrentMemberChannelMember = true;
      else if (result.channel.type === Channel.TYPE.PRIVATE) {
        createAndPushChannel(result.channel);
        $rootScope.$broadcast('channels:updated');
      }
    });

    socket.on('channel:members:remove', function (result) {
      var channel = findChannelById(result.channel.id);
      if (result.channel.type === Channel.TYPE.PUBLIC)
        channel.isCurrentMemberChannelMember = false;
      else if (result.channel.type === Channel.TYPE.PRIVATE) {
        channel.setIsRemoved();
        $rootScope.$broadcast('channels:updated');
      }
    });

    socket.on('channel:archived', function (result) {
      var channel = findChannelById(result.channelId);
      if (channel) {
        channel.setIsArchived();
        $rootScope.$broadcast('channels:updated');
      }
    });

    socket.on('channel:mute:toggle', function (channelId) {
      var channel = findChannelById(channelId);
      if (channel)
        channel.isMuted = !channel.isMuted;
    });

    /**
     * @summary RootScope listeners.
     */

    $rootScope.$on('socket:connected', function () {
      if (self.initialChannelsGottenForFirstTime) {
        getInitialChannels();
      }
    });

    /**
     * @summary Methods
     */

    function initialize() {
      getInitialChannels();
    }

    function getInitialChannels() {
    try {
      socket.emit('channel:init', null, function (results) {
        self.channels = [];
        self.initChannelsCount = results.length;
        if (self.initChannelsCount === 0) {
          $rootScope.isLoading = false;
        }
        if (Team.areMembersReady) {
          results.forEach(function (result) {
            var channel = createAndPushChannel(result);
            $rootScope.$emit('channel:new', channel);
          });
          $rootScope.$broadcast('channels:updated', 'init');
        } else {
          Team.membersPromise.then(function () {
            results.forEach(function (result) {
              var channel = createAndPushChannel(result);
              $rootScope.$emit('channel:new', channel);
            });
            $rootScope.$broadcast('channels:updated', 'init');
          });
        }
        self.initialChannelsGottenForFirstTime = true;
      });
    } catch (err) {
      console.log('err', err);
    }
    }

    function setChannelLivedFileId(channelId, fileId) {
      var channel = findChannelById(channelId);
      channel.liveFileId = fileId;
      $rootScope.$broadcast('channels:updated');
    }

    function setDirectActiveState(username, state) {
      var channel = findChannelBySlug(username);
      channel.active = state;
    }

    function createAndPushChannel(data) {
      var channel = new Channel(data.name, data.slug, data.description,
        data.type, data.id, data.membersCount, data.memberId,
        data.isFakeDirect, data.liveFileId, data.teamId,
        data.isCurrentMemberChannelMember, data.isMuted, data.lastSeenMessageId,
        data.lastMessageDatetime, data.lastMessageId, data.memberLastSeenMessageId);
      if (channel.isDirect() && !channel.isFakeDirect && !CurrentMember.member
        .isTecomBot()) {
        channel.changeNameAndSlugFromId();
        if (!Team.isMemberActiveByUsername(channel.slug)) {
          channel.active = false;
        }
        var fakeDirect = findChannelBySlug(channel.slug);
        if (fakeDirect) {
          fakeDirect.setValues(channel.name, channel.slug, channel.description,
            channel.type, channel.id, channel.membersCount, null,
            channel.memberId, false, channel.liveFileId);
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
      var defer = $q.defer();
      if (!slug) {
        setCurrentChannel(null);
        defer.resolve();
      } else {
        var channel = findChannelBySlug(slug);
        if (!channel) {
          setCurrentChannel(null);
          defer.resolve();
        } else if (channel.isDirect() && channel.isFakeDirect) {
          createDirect(channel.member.id)
            .then(function () {
              setCurrentChannel(channel);
              defer.resolve();
            });
        } else {
          setCurrentChannel(channel);
          defer.resolve();
        }
      }
      return defer.promise;
    }

    function setCurrentChannel(channel) {
      self.currentChannel = channel;
      $rootScope.$broadcast('channel:changed');
    }

    function getCurrentChannel() {
      return self.currentChannel;
    }

    function areChannelsReady() {
      return !$rootScope.isLoading;
    }

    function toggleisMuted(channelId) {
      var deferred = $q.defer();
      var data = {
        channelId: channelId
      };
      socket.emit('channel:mute:toggle', data, function (res) {
        if (res.status) {
          deferred.resolve();
        } else {
          deferred.reject(res.message);
          $log.error('Toggle Channel Disturb Mode failed.', res.message);
        }
      });
      return deferred.promise;
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
      socket.emit('channel:edit:details', channel, function (res) {
        if (res.status) {
          defer.resolve();
        }
        else {
          defer.reject(res.message);
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
      socket.emit('channel:members:add', data, function (res) {
        if (res.status)
          defer.resolve(res.channelMembers);
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
        } else
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

    function updateChannelNotification(channelId, type) {
      var channel = findChannelById(channelId);
      switch (type) {
      case 'empty':
        channel.memberLastSeenId = channel.lastMessageId;
        break;
      case 'inc':
        if (!channel.lastMessageId)
          channel.lastMessageId=1;
        else
          channel.lastMessageId++;
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
        url: '/api/v1/messenger/channels/' + channelId + '/members/'
      }).then(function (data) {
        deferred.resolve(data);
      }).catch(function (err) {
        $log.info('Error Getting channel members.', err);
        deferred.reject(err);
      });
      return deferred.promise;
    }

    function anyChannelHasUnread() {
      for (var i = 0; i < self.channels.length; i++) {
        if (self.channels[i].hasUnread() && self.channels[i].isCurrentMemberPublicChannelMember()) {
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

    function removeChannel(channelId) {
      ArrayUtil.removeElementByKeyValue(self.channels, 'id', channelId);
      $rootScope.$broadcast('channels:updated');
    }

    function archiveChannel(channelId) {
      var defer = $q.defer();
      var data = {
        channelId: channelId
      };
      socket.emit('channel:archive', data, function (results) {
        if (results.status) {
          $log.info('Channel succesfully Archived');
          defer.resolve();
        } else {
          $log.error('Error Archiving Channel : ', results.message);
          defer.reject();
        }
      });
      return defer.promise;
    }

    /**
     * @summary Public API
     */

    return {
      getPublicsAndPrivates: getPublicsAndPrivates,
      getDirects: getDirects,
      getChannels: getChannels,
      anyChannelHasUnread: anyChannelHasUnread,
      createAndPushChannel: createAndPushChannel,
      findChannelById: findChannelById,
      findChannelBySlug: findChannelBySlug,
      setCurrentChannelBySlug: setCurrentChannelBySlug,
      getCurrentChannel: getCurrentChannel,
      areChannelsReady: areChannelsReady,
      toggleisMuted: toggleisMuted,
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
      getChannelMembers: getChannelMembers,
      setChannelLivedFileId: setChannelLivedFileId,
      setDirectActiveState: setDirectActiveState,
      archiveChannel: archiveChannel,
      removeChannel: removeChannel,
    };
  }
]);
