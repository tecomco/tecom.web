'use strict';

app.factory('Channel',
  ['$log', '$stateParams', 'textUtil', 'Team', 'User', 'arrayUtil',
  function ($log, $stateParams, textUtil, Team, User, arrayUtil) {

    function Channel(name, slug, description, type, id, membersCount,
      notifCount) {
      this.setValues(name, slug, description, type, id, membersCount, notifCount);
      this.isTypingMemberIds = [];
    }

    Channel.prototype.setValues = function (name, slug, description, type, id,
      membersCount, notifCount) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.type = type;
        this.id = id;
        this.membersCount = membersCount;
        this.notifCount = notifCount || null;
    };

    Channel.prototype.hasUnread = function () {
      return this.notifCount && this.notifCount !== 0;
    };

    Channel.prototype.updateFromJson = function (channel) {
      this.name = null || channel.name;
      this.slug = null || channel.slug;
      this.description = null || channel.description;
      this.type = null || channel.type;
      this.id = null || channel.id;
      this.membersCount = null || channel.membersCount;
      this.notifCount = null || channel.notifCount;
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

    Channel.prototype.updateIsTypingMemberIds = function (memberId, mode) {
      switch (mode) {
      case 'add':
        this.isTypingMemberIds.push(memberId);
        break;
      case 'remove':
        arrayUtil.removeElementByValue(this.isTypingMemberIds, memberId);
        break;
      }
    };

    Channel.prototype.getIsTypingStringFromMemberIds = function () {
      var isTypingStr = '';
      angular.forEach(this.isTypingMemberIds, function (memberId) {
        isTypingStr += User.team.getNameById(memberId);
        isTypingStr += ' و ';
      });
      return isTypingStr.slice(0, isTypingStr.length - 3);
    };

    Channel.prototype.anyoneTyping = function () {
      return (this.isTypingMemberIds.length > 0);
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

    Channel.prototype.setDirectCreatedStatus = function () {
      this.memberId = null;
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
      var that = this;
      var ids = [];
      ids.push(parseInt(this.slug.slice(0, this.slug.indexOf(':'))));
      ids.push(parseInt(this.slug.slice(this.slug.indexOf(':') + 1,
        this.slug.length)));
      ids.forEach(function (id) {
        if (id !== User.id) {
          var name = User.team.getUsernameById(id);
          that.name = name;
          that.slug = name;
          textUtil.replaceAll(that.slug, ' ', '_');
          return;
        }
      });
    };

    Channel.prototype.updateNewDirectData = function (direct) {
      this.name = direct.name;
      this.slug = direct.slug;
      this.memberId = null;
      this.id = direct.id;
    };

    Channel.isSelected = function () {
      return $stateParams.channel.id === this.id;
    };

    Channel.prototype.setIsRemoved = function () {
      this.isRemoved = true;
    };

    Channel.prototype.isRemoved = function () {
      return this.isRemoved || false;
    };

    Channel.TYPE = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };

    return Channel;

  }
]);
