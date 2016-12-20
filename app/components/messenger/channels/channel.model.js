'use strict';

app.factory('Channel', ['$log', 'messagesService', 'socket',
  function ($log, messagesService, socket) {

    function Channel(name, slug, description, type, id, membersCount, notifCount) {
      this.name = name;
      this.slug = slug;
      this.description = description;
      this.type = type;
      this.id = id;
      this.membersCount = membersCount;
      this.notifCount = null || notifCount;
    }

    Channel.prototype.setSeenStatus = function (channelLastSeenId, userLastSeenId) {
      if (channelLastSeenId !== null && userLastSeenId !== null) {
        this.channelLastSeen = channelLastSeenId;
        this.userLastSeenId = userLastSeenId;
        this.notificationCount = this.channelLastSeenId - userLastSeenId;
      }
    };

    Channel.prototype.sendSeenStatusToServer = function () {
      var thisChannel = this;
      if (this.hasUnread()) {
        messagesService.getLastMessageFromDb(this.id).then(function (lastMessage) {
          Channel.sendSeenNotif(thisChannel.id, lastMessage.id, lastMessage.sender);
        });
        this.notifCount = 0;
      }
    };

    Channel.prototype.hasUnread = function () {
      return this.notifCount && this.notifCount !== 0;
    };

    Channel.prototype.updateNotif = function (notifCount) {
      this.notifCount = notifCount;
    };

    Channel.prototype.updateLastMessageDatetime = function (datetime) {
      this.lastMessageDatetime = datetime;
    };

    Channel.prototype.getCssClass = function () {
      return (this.type == Channel.TYPE.PRIVATE) ? 'fa fa-lock' : 'fa fa-globe';
    };

    Channel.prototype.isPrivate = function () {
      return this.type == Channel.TYPE.PRIVATE;
    };

    Channel.prototype.isDirect = function () {
      return this.type == Channel.TYPE.DIRECT;
    };

    Channel.prototype.isPublic = function () {
      return this.type == Channel.TYPE.PUBLIC;
    };

    Channel.prototype.filterByPublicAndPrivate = function () {
      return this.isPublic() || this.isPrivate();
    };

    Channel.prototype.filterByDirect = function () {
      return this.type === Channel.TYPE.DIRECT;
    };

    Channel.isCurrentChannel = function () {
      return ($stateParams.channel.id === this.id);
    };

    Channel.sendSeenNotif = function (channelId, lastMessageId, senderId) {
      var data = {
        channelId: channelId,
        lastMessageId: lastMessageId,
        senderId: senderId
      };
      socket.emit('message:seen', data);
    };

    Channel.TYPE = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };

    return Channel;

  }]);
