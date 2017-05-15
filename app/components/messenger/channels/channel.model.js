'use strict';

app.factory('Channel', [
  '$stateParams', 'textUtil', 'ArrayUtil', '$q', 'CurrentMember', 'Team',
  function ($stateParams, textUtil, ArrayUtil, $q, CurrentMember, Team) {

    function Channel(name, slug, description, type, id, membersCount,
                     notifCount, memberId, liveFileId, teamId) {
      this.setValues(name, slug, description, type, id, membersCount,
        notifCount, memberId, liveFileId, teamId);
      this.isTypingMemberIds = [];
      this.hideNotif = null;
    }

    Channel.prototype.setValues = function (name, slug, description, type, id,
                                            membersCount, notifCount, memberId,
                                            liveFileId, teamId) {
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
      this.active = true;
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
        isTypingStr += Team.getUsernameByMemberId(memberId);
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
      var deferred = $q.defer();
      var that = this;
      var ids = [];
      ids.push(parseInt(this.slug.slice(0, this.slug.indexOf(':'))));
      ids.push(parseInt(this.slug.slice(this.slug.indexOf(':') + 1,
        this.slug.length)));
      ids.forEach(function (id) {
        if (id !== CurrentMember.member.id) {
          if (Team.areMembersReady) {
            that.setNameAndSlugById(id);
            deferred.resolve();
          } else {
            Team.membersPromise.then(function () {
              that.setNameAndSlugById(id);
              deferred.resolve();
            });
          }
        }
      });
      return deferred.promise;
    };

    Channel.prototype.setNameAndSlugById = function (id) {
      var name = Team.getUsernameByMemberId(id);
      this.name = name;
      this.slug = name;
    };

    Channel.prototype.getChannelData = function () {
      var data = {
        'name': this.name,
        'slug': this.slug,
        'description': this.description,
        'type': this.type,
        'id': this.id,
        'membersCount': this.membersCount,
        'notifCount': this.notifCount,
        'memberId': this.memberId,
        'liveFileId': this.liveFileId,
        'teamId': this.teamId,
        'active': this.active,
      };
      return data;
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

    Channel.prototype.setIsArchived = function () {
      this.isArchived = true;
    };

    Channel.prototype.getIsArchived = function () {
      return this.isArchived || false;
    };

    Channel.TYPE = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };

    return Channel;
  }
]);
