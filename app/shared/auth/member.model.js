'use strict';

app.factory('Member', ['User', function(User) {

  function Member(teamMemberId, isAdmin, active, userId, username, email,
    image) {
    this.id = teamMemberId;
    this.isAdmin = isAdmin;
    this.active = active;
    this.user = new User(userId, username, email, image);
  }

  Member.prototype.isTecomBot = function() {
    return this.id === Member.TECOM_BOT.id;
  };

  Member.TECOM_BOT = {
    id: 0,
    username: 'تیک-بات'
  };

  return Member;
}]);
