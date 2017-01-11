'use strict';

app.factory('Channel', ['$log', '$stateParams', 'textUtil', 'Team', 'User',
  function ($log, $stateParams, textUtil, Team, User) {

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
      if (this.membersCount)
        return textUtil.persianify(this.membersCount.toString());
    };

    Channel.prototype.updateLastDatetimeCallback = function (datetime) {
      this.lastDatetime = datetime;
    };

    Channel.prototype.getCssClass = function () {
      switch (this.type) {
        case Channel.TYPE.PUBLIC:
          return 'fa fa-globe';
        case Channel.TYPE.PRIVATE:
          return 'fa fa-lock';
        case Channel.TYPE.DIRECT:
          return 'fa fa-at';
      }
    };

    Channel.prototype.isDirectExist = function () {
      return !this.memberId;
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

    Channel.prototype.changeNameAndSlugFromId = function () {
      var ids = [];
      ids.push(parseInt(this.slug.slice(0, this.slug.indexOf(':'))));
      ids.push(parseInt(this.slug.slice(this.slug.indexOf(':') + 1,
        this.slug.length)));
      $log.info("ids", ids);
      $log.info('My_ID:', User.id);
      ids.forEach(function (id) {
        if (id !== User.id) {
          $log.info('OtherID:', id);
          /*var name = User.team.getNameById(id);
          $log.info('NAMEEE:', name);
          this.name = name;
          this.slug = name;
          textUtil.replaceAll(this.slug, ' ', '_');
          return;*/
        }
      });
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
