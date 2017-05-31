'use strict';

app.factory('Channel', [
  '$stateParams', 'textUtil', 'ArrayUtil', '$q', 'CurrentMember', 'Team',
  'Member',
  function ($stateParams, textUtil, ArrayUtil, $q, CurrentMember, Team,
    Member) {

    function Channel(name, slug, description, type, id, membersCount,
      notifCount, memberId, isFakeDirect, liveFileId, teamId,
      isCurrentMemberChannelMember, isMuted) {
      this.setValues(name, slug, description, type, id, membersCount,
        notifCount, memberId, isFakeDirect, liveFileId, teamId,
        isCurrentMemberChannelMember, isMuted);
      this.isTypingMemberIds = [];
      this.hideNotifFunction = null;
    }

    Channel.prototype.setValues = function (name, slug, description, type,
      id, membersCount, notifCount, memberId, isFakeDirect, liveFileId,
      teamId, isCurrentMemberChannelMember, isMuted) {
      this.name = name;
      this.slug = slug;
      this.description = description;
      this.type = type;
      this.id = id;
      this.membersCount = membersCount;
      this.notifCount = notifCount || null;
      if (memberId) {
        this.member = Team.getMemberByMemberId(memberId);
      }
      this.isFakeDirect = isFakeDirect;
      this.liveFileId = liveFileId;
      this.teamId = teamId;
      this.active = true;
      this.isCurrentMemberChannelMember = isCurrentMemberChannelMember;
      this.isMuted = isMuted;
    };

    Channel.prototype.hasUnread = function () {
      return this.notifCount && this.notifCount !== 0;
    };

    Channel.prototype.isCurrentMemberPublicChannelMember = function () {
      if (this.isPublic())
        return this.isCurrentMemberChannelMember;
      else
        return true;
    };

    Channel.prototype.getDescription = function () {
      return this.description || 'این گروه توضیحی ندارد.';
    };

    Channel.prototype.shouldSendNotification = function () {
      if (this.hideNotifFunction) {
        this.hideNotifFunction();
        this.hideNotifFunction = null;
      }
      return (this.isCurrentMemberPublicChannelMember() && !
        CurrentMember.member.dontDisturbMode && !this.isMuted);
    };

    Channel.prototype.updateFromJson = function (json) {
      this.name = json.name || null;
      this.slug = json.slug || null;
      this.description = json.description || null;
      this.type = json.type;
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
      if (this.slug === Member.TECOM_BOT.username)
        return 'fa fa-heart-o';
      switch (this.member.status) {
      case Member.STATUS.OFFLINE:
        return 'fa fa-at status-offline';
      case Member.STATUS.ONLINE:
        return 'fa fa-at status-online';
      case Member.STATUS.DEACTIVE:
        return 'fa fa-wheelchair';
      }
      }
    };

    Channel.prototype.getNotifCountClass = function () {
      return this.isCurrentMemberChannelMember ? 'badge' :
        'badge badge-grey';
    };

    Channel.prototype.getCssClass = function () {
      return this.isSelected() ? 'active' : '';
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
        if (id !== CurrentMember.member.id) {
          that.setNameAndSlugById(id);
        }
      });
    };

    Channel.prototype.setNameAndSlugById = function (id) {
      var name = Team.getUsernameByMemberId(id);
      this.name = name;
      this.slug = name;
    };

    Channel.prototype.getChannelData = function () {
      var data = {
        'name': this.name,
        'description': this.description,
        'type': this.type,
      };
      return data;
    };

    Channel.prototype.getUrlifiedSlug = function () {
      return this.isDirect() ? '@' + this.slug : this.slug;
    };

    Channel.prototype.setIsRemoved = function () {
      this.isRemoved = true;
      this.isCurrentMemberChannelMember = false;
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
