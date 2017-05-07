'use strict';

app.factory('ChannelMemberItem', ['User', function (User) {

  function ChannelMemberItem(teamMemberId) {
    this.member = User.getCurrent().team.getMemberById(teamMemberId);
    this.teamMemberId = this.member.id;
    this.username = this.member.username;
    this.isSelected = false;
    this.temporaryInChannel = false;
    this.channelMemberId = null;
  }

  ChannelMemberItem.prototype.isChannelMember = function () {
    return (this.channelMemberId || this.temporaryInChannel) ? true : false;
  };

  ChannelMemberItem.prototype.setChannelMemberId = function (channelMemberId) {
    this.channelMemberId = channelMemberId;
    this.temporaryInChannel = false;
  };

  ChannelMemberItem.prototype.removeChannelMemberId = function () {
    this.channelMemberId = null;
    this.temporaryInChannel = false;
    this.isSelected = false;
  };

  ChannelMemberItem.prototype.getCssClass = function (addMemberMode) {
    if (addMemberMode) {
      if (this.isChannelMember())
        return 'disabled';
      else if (this.isSelected)
        return 'selected';
      else
        return 'selectable';
    }
    else
      return 'disabled';
  };

  ChannelMemberItem.prototype.getImage = function () {
    if (this.member.image)
      return this.member.image;
    else
      return 'static/img/user-def.png';
  };

  ChannelMemberItem.prototype.click = function (addMemberMode) {
    if (addMemberMode)
      this.isSelected = !this.isSelected;
  };

  ChannelMemberItem.prototype.setTemporaryInChannel = function () {
    this.temporaryInChannel = true;
  };

  ChannelMemberItem.prototype.removeFromTemporary = function () {
    this.temporaryInChannel = false;
  };

  return ChannelMemberItem;
}]);
