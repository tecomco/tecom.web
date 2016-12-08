'use strict';

app.factory('Channel', ['$log', function ($log) {

  function Channel(name, slug, description, type, id, membersCount,
                   lastMessageId, channelLastSeenId, userLastSeenId) {
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.type = type;
    this.id = id;
    this.membersCount = membersCount;
    this.lastMessage = lastMessageId || null;
    this.channelLastSeen = channelLastSeenId || null;
    this.userLastSeen = userLastSeenId || null;
    this.setSeenStatus();
  }

  Channel.prototype.setSeenStatus = function(channelLastSeenId, userLastSeenId){
    if (channelLastSeenId !== null && userLastSeenId !== null) {
      this.channelLastSeen = channelLastSeenId;
      this.userLastSeenId = userLastSeenId;
      this.notificationCount = this.channelLastSeenId - userLastSeenId;
    }
  };
  Channel.prototype.getCssClass = function () {
    return (this.type == Channel.TYPE.PRIVATE) ? 'fa fa-lock' : 'fa fa-globe';
  };

  Channel.prototype.isPrivate = function () {
    return (this.type == Channel.TYPE.PRIVATE) ? true : false;
  };
  Channel.prototype.isDirect = function () {
    return (this.type == Channel.TYPE.DIRECT) ? true : false;
  };
  Channel.prototype.isPublic = function () {
    return (this.type == Channel.TYPE.PUBLIC) ? true : false;
  };

  Channel.prototype.filterByPublicAndPrivate = function () {
    return this.isPublic() || this.isPrivate();
  };

  Channel.prototype.filterByDirect = function () {
    return this.type === Channel.TYPE.DIRECT;
  };

  Channel.TYPE = {
    PUBLIC: 0,
    PRIVATE: 1,
    DIRECT: 2
  };

  return Channel;

}]);
