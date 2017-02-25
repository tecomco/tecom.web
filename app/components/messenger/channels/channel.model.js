'use strict';

app.factory('Channel', [
  '$stateParams', 'textUtil', 'User', 'ArrayUtil',
  function ($stateParams, textUtil, User, ArrayUtil) {

    function Channel(name, slug, description, type, id, membersCount,
                     notifCount, memberId, liveFileId, teamId) {
      this.setValues(name, slug, description, type, id, membersCount,
        notifCount, memberId, liveFileId, teamId);
      this.isTypingMemberIds = [];
    }

    Channel.prototype.setValues = function (name, slug, description, type, id,
                                            membersCount, notifCount, memberId, liveFileId, teamId) {
      this.name = name;
      this.slug = slug;
      this.description = description;
      this.type = type;
      this.id = id;
      this.membersCount = membersCount;
      this.notifCount = notifCount || null;
      this.memberId = memberId;
      this.liveFileId = liveFileId;
      this.teamId = teamId;
    };

    Channel.prototype.hasUnread = function () {
      return this.notifCount && this.notifCount !== 0;
    };

    Channel.prototype.updateFromJson = function (json) {
      this.name = json.name || null;
      this.slug = json.slug || null;
      this.description = json.description || null;
      this.type = json.type;
      this.id = json.id || null;
      this.membersCount = json.membersCount || null;
      this.notifCount = json.notifCount || null;
      this.memberId = json.memberId || null;
    };

    Channel.prototype.getLocaleNotifCount = function () {
      return this.hasUnread() ?
        textUtil.persianify(this.notifCount.toString()) : null;
    };

    Channel.prototype.getLocaleMembersCount = function () {
      return this.membersCount ?
        textUtil.persianify(this.membersCount.toString()) : null;
    };

    Channel.prototype.setLastDatetime = function (datetime) {
      this.lastDatetime = datetime;
    };

    Channel.prototype.setLastSeen = function (lastSeenMessageId) {
      this.lastSeen = lastSeenMessageId;
    };

    Channel.prototype.addIsTypingMemberId = function (memberId) {
      this.isTypingMemberIds.push(memberId);
    };

    Channel.prototype.removeIsTypingMemberId = function (memberId) {
      ArrayUtil.removeElementByValue(this.isTypingMemberIds, memberId);
    };

    Channel.prototype.getIsTypingString = function () {
      var isTypingStr = '';
      angular.forEach(this.isTypingMemberIds, function (memberId) {
        isTypingStr += User.getCurrent().team.getUsernameById(memberId);
        isTypingStr += ' و ';
      });
      return isTypingStr.slice(0, isTypingStr.length - 3);
    };

    Channel.prototype.anyoneTyping = function () {
      var anyoneTyping = (this.isTypingMemberIds.length > 0);
      return anyoneTyping;
    };

    Channel.prototype.isSelected = function () {
      var slug = this.isDirect() ? '@' + this.slug : this.slug;
      return $stateParams.slug === slug;
    };

    Channel.prototype.getIconClass = function () {
      switch (this.type) {
        case Channel.TYPE.PUBLIC:
          return 'fa fa-globe';
        case Channel.TYPE.PRIVATE:
          return 'fa fa-lock';
        case Channel.TYPE.DIRECT:
          return 'fa fa-at';
      }
    };

    Channel.prototype.getCssClass = function () {
      return this.isSelected() ? 'active' : '';
    };

    Channel.prototype.isDirectExist = function () {
      return this.memberId === undefined;
    };

    Channel.prototype.isPrivate = function () {
      return this.type === Channel.TYPE.PRIVATE;
    };

    Channel.prototype.isDirect = function () {
      return this.type === Channel.TYPE.DIRECT;
    };

    Channel.prototype.isPublic = function () {
      return this.type === Channel.TYPE.PUBLIC;
    };

    Channel.prototype.changeNameAndSlugFromId = function () {
      var that = this;
      var ids = [];
      ids.push(parseInt(this.slug.slice(0, this.slug.indexOf(':'))));
      ids.push(parseInt(this.slug.slice(this.slug.indexOf(':') + 1,
        this.slug.length)));
      ids.forEach(function (id) {
        if (id !== User.getCurrent().memberId) {
          var team = User.getCurrent().team;
          if (team.areMembersReady) {
            that.setNameAndSlugById(team, id);
          } else {
            team.membersPromise.then(function () {
              that.setNameAndSlugById(team, id);
            });
          }
          return;
        }
      });
    };

    Channel.prototype.setNameAndSlugById = function (team, id) {
      var name = team.getUsernameById(id);
      this.name = name;
      this.slug = name;
    };

    Channel.prototype.getUrlifiedSlug = function () {
      return this.isDirect() ? '@' + this.slug : this.slug;
    };

    Channel.prototype.setIsRemoved = function () {
      this.isRemoved = true;
    };

    Channel.prototype.getIsRemoved = function () {
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
