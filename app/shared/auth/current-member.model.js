'use strict';

app.factory('CurrentMember', ['Member', function (Member) {

  function CurrentMember() {}

  CurrentMember.initialize = function (id, isAdmin, userId, username,
    email, image) {
    CurrentMember.member = new Member(id, isAdmin, true, userId,
      username,
      email, image);
  };

  CurrentMember.exists = function () {
    return CurrentMember.member ? true : false;
  };

  return CurrentMember;
}]);