'use strict';

app.factory('Member', ['User', function (User) {

  function Member(teamMemberId, isAdmin, userId, username, email,
    image, status) {
    this.id = teamMemberId;
    this.isAdmin = isAdmin;
    this.user = new User(userId, username, email, image);
    this.status = status;
  }

  Member.prototype.isTecomBot = function () {
    return this.id === Member.TECOM_BOT.id;
  };

  Member.prototype.isActive = function () {
    return this.status !== Member.STATUS.DEACTIVE;
  };

  /**
   * @todo Create an exclusive image for tecom-bot.
   */
  Member.TECOM_BOT = {
    id: 0,
    username: 'تیک-بات',
    image: 'static/img/user-def.png'
  };

  Member.STATUS = {
    OFFLINE: 0,
    ONLINE: 1,
    DEACTIVE: 2
  };

  return Member;
}]);
