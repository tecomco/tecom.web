'use strict';

app.factory('CurrentMember', ['Member', function (Member) {

  function CurrentMember() {}

  CurrentMember.initialize = function (id, isAdmin, userId, username,
    email, image) {
    CurrentMember.member = new Member(id, isAdmin, userId, username,
      email, image, Member.STATUS.ONLINE);
  };

  CurrentMember.exists = function () {
    return CurrentMember.member ? true : false;
  };

  return CurrentMember;
}]);
