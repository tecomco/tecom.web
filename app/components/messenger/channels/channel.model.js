'use strict';

app.factory('Channel', ['$log', '$stateParams', 'textUtil',
  function ($log, $stateParams, textUtil) {

    function Channel(name, slug, description, type, id, membersCount,
      notifCount) {
      this.name = name;
      this.slug = slug;
      this.description = description;
      this.type = type;
      this.id = id;
      this.membersCount = membersCount;
      this.notifCount = null || notifCount;
    }

    Channel.prototype.hasUnread = function () {
      return this.notifCount && this.notifCount !== 0;
    };

    Channel.prototype.getNotifInPersian = function () {
      if (this.hasUnread())
        return textUtil.persianify(this.notifCount.toString());
      return null;
    };

    Channel.prototype.getLocaleMembersCount = function () {
      return textUtil.persianify(this.membersCount.toString());
    };

    Channel.prototype.updateLastDatetimeCallback = function (datetime) {
      this.lastDatetime = datetime;
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

    Channel.isCurrentChannel = function () {
      return ($stateParams.channel.id === this.id);
    };

    Channel.TYPE = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };

    return Channel;

  }
]);
