'use strict';

app.factory('CurrentMember', ['Member', '$localStorage', function (Member,
  $localStorage) {

  function CurrentMember() {}

  CurrentMember.initialize = function (id, isAdmin, userId, username,
    email, image) {
    CurrentMember.member = new Member(id, isAdmin, userId, username,
      email, image, Member.STATUS.ONLINE);
  };

  CurrentMember.exists = function () {
    return CurrentMember.member ? true : false;
  };

  CurrentMember.getDontDisturbModeStatus = function () {
    return $localStorage.dontDisturbMode || CurrentMember.DONT_DISTURB_MODE
      .DEACTIVE;
  };

  CurrentMember.DONT_DISTURB_MODE = {
    DEACTIVE: 0,
    ACTIVE: 1,
    TIMEACTIVE: 2
  };

  return CurrentMember;
}]);
