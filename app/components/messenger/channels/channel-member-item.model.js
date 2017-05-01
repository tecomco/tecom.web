'use strict';

app.factory('channelDetailsItem', ['User', function (User) {

  function channelDetailsMember(teamMemberId, channelMemberId) {
    this.memberRefrence = User.getCurrent().team.getMemberById(teamMemberId);
    this.channelMemberId = channelMemberId || null;
  }

  channelDetailsItem.prototype.isAlreadyInChannel = function(){

  };

  channelDetailsItem.prototype.getCssClass = function(){

  };

  channelDetailsItem.prototype.getImage = function(){

  };

  return channelDetailsItem;
}
]);
