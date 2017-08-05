'use strict';

app.factory('CurrentMember', ['Member', '$localStorage', '$timeout',
  function (Member, $localStorage, $timeout) {

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

    CurrentMember.setDontDisturbModeTime = function (miliseconds) {
      CurrentMember.setDontDisturbModeTimeProperties(miliseconds);
      CurrentMember.setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.TIMEACTIVE);
      CurrentMember.setTimeOutForNotifications(miliseconds);
    };

    CurrentMember.setDontDisturbModeTimeProperties = function (time) {
      var startTime = +new Date();
      CurrentMember.dontDisturbModeTime = time;
      $localStorage.dontDisturbModeTime = time;
      CurrentMember.dontDisturbModeStartTime = startTime;
      $localStorage.dontDisturbModeStartTime = startTime;
    };

    CurrentMember.removeDontDisturbModeTimeProperties = function () {
      delete $localStorage.dontDisturbModeTime;
      CurrentMember.dontDisturbModeTime = null;
      delete $localStorage.dontDisturbModeStartTime;
      CurrentMember.dontDisturbModeStartTime = null;
    };

    CurrentMember.setDontDisturbMode = function (mode) {
      $localStorage.dontDisturbMode = mode;
      CurrentMember.dontDisturbMode = mode;
    };

    CurrentMember.setTimeOutForNotifications = function (time) {
      $timeout(function () {
        CurrentMember.removeDontDisturbModeTimeProperties();
        CurrentMember.setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE
          .DEACTIVE);
      }, time);
    };

    CurrentMember.DONT_DISTURB_MODE = {
      DEACTIVE: 0,
      ACTIVE: 1,
      TIMEACTIVE: 2
    };

    return CurrentMember;
  }
]);
