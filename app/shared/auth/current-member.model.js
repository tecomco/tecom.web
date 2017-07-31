'use strict';

app.factory('CurrentMember', ['Member', '$localStorage', function (Member,
  $localStorage) {

  function CurrentMember() {}

  CurrentMember.initialize = function (id, isAdmin, userId, username,
    email, image) {
      console.log('isAdmin property making',isAdmin);
    CurrentMember.member = new Member(id, isAdmin, userId, username,
      email, image, Member.STATUS.ONLINE);
      console.log('current member',CurrentMember.member);
    CurrentMember.dontDisturbMode = $localStorage.dontDisturbMode || false;
    CurrentMember.isReady = true;
  };

  CurrentMember.exists = function () {
    return CurrentMember.member ? true : false;
  };

  return CurrentMember;
}]);
