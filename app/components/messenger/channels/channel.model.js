'use strict';

app.factory('Channel', ['$log', function ($log) {

  function Channel(name, slug, description, type, id, membersCount) {
    this.name = name;
    this.slug = slug;
    this.description = description;
    this.type = type;
    this.id = id;
    this.membersCount = membersCount;
  }

  Channel.prototype.setSeenStatus = function (channelLastSeenId, userLastSeenId) {
    if (channelLastSeenId !== null && userLastSeenId !== null) {
      this.channelLastSeen = channelLastSeenId;
      this.userLastSeenId = userLastSeenId;
      this.notificationCount = this.channelLastSeenId - userLastSeenId;
    }
  };

  Channel.prototype.containsUnread = function () {
    return !(this.notifCount || this.notifCount === 0);
  };

  Channel.prototype.updateNotif = function (notifCount) {
    this.notifCount = notifCount;
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

  Channel.TYPE = {
    PUBLIC: 0,
    PRIVATE: 1,
    DIRECT: 2
  };

  return Channel;

}]);
