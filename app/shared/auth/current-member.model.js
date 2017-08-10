'use strict';

app.factory('CurrentMember', ['Member', '$localStorage', '$timeout', 'textUtil',
  '$interval',
  function (Member, $localStorage, $timeout, textUtil, $interval) {

    function CurrentMember() {}

    CurrentMember.initialize = function (id, isAdmin, userId, username,
      email, image) {
      CurrentMember.member = new Member(id, isAdmin, userId, username,
        email, image, Member.STATUS.ONLINE);
    };

    CurrentMember.exists = function () {
      return CurrentMember.member ? true : false;
    };

    CurrentMember.initializeDontDisturbMode = function () {
      CurrentMember.dontDisturb = {};
      if (!$localStorage.dontDisturb)
        CurrentMember.initializeInitialJsons();
      else {
        var duration = $localStorage.dontDisturb.duration;
        if (duration)
          CurrentMember.checkShouldContinueTimeActive(duration);
        else {
          CurrentMember.dontDisturb.mode = $localStorage.dontDisturb.mode;
        }
      }
    };

    CurrentMember.initializeInitialJsons = function () {
      var initMode = {
        mode: CurrentMember.DONT_DISTURB_MODE.DEACTIVE
      };
      $localStorage.dontDisturb = initMode;
      CurrentMember.dontDisturb.mode = $localStorage.dontDisturb.mode;
    };

    CurrentMember.checkShouldContinueTimeActive = function (duration) {
      var initTime = +new Date();
      var startTime = $localStorage.dontDisturb.startTime;
      if (initTime - startTime < duration) {
        CurrentMember.activateTimeDontDisturbMode(startTime + duration -
          initTime);
      } else {
        CurrentMember.removeDontDisturbModeTimeProperties();
        CurrentMember.setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE
          .DEACTIVE);
      }
    };

    CurrentMember.setDontDisturbMode = function (mode) {
      $localStorage.dontDisturb.mode = mode;
      CurrentMember.dontDisturb.mode = mode;
    };

    CurrentMember.activateTimeDontDisturbMode = function (miliseconds) {
      CurrentMember.setDontDisturbModeTimeProperties(miliseconds);
      CurrentMember.setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.TIMEACTIVE);
      CurrentMember.setDontDisturbTimeout(miliseconds);
      CurrentMember.dontDisturbInterval = $interval(function () {
        CurrentMember.updateDontDisturbRemainingTime();
      }, 1000);
    };

    CurrentMember.activateDontDisturbMode = function () {
      if (CurrentMember.dontDisturb.mode === CurrentMember.DONT_DISTURB_MODE
        .TIMEACTIVE) {
        CurrentMember.removeDontDisturbModeTimeProperties();
        $timeout.cancel(CurrentMember.dontDisturbTimeout);
        CurrentMember.removeDontDisturbModeRemainingTime();
      }
      CurrentMember.setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.ACTIVE);
    };

    CurrentMember.deactivateDontDisturbMode = function () {
      if (CurrentMember.dontDisturb.mode === CurrentMember.DONT_DISTURB_MODE
        .TIMEACTIVE) {
        CurrentMember.removeDontDisturbModeTimeProperties();
        $timeout.cancel(CurrentMember.dontDisturbTimeout);
        CurrentMember.removeDontDisturbModeRemainingTime();
      }
      CurrentMember.setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.DEACTIVE);
    };

    CurrentMember.setDontDisturbModeTimeProperties = function (duration) {
      var startTime = +new Date();
      CurrentMember.dontDisturb.duration = duration;
      $localStorage.dontDisturb.duration = duration;
      CurrentMember.dontDisturb.startTime = startTime;
      $localStorage.dontDisturb.startTime = startTime;
    };

    CurrentMember.removeDontDisturbModeTimeProperties = function () {
      delete $localStorage.dontDisturb.duration;
      CurrentMember.dontDisturb.duration = null;
      delete $localStorage.dontDisturb.startTime;
      CurrentMember.dontDisturb.startTime = null;
    };

    CurrentMember.removeDontDisturbModeRemainingTime = function () {
      $interval.cancel(CurrentMember.dontDisturbInterval);
      CurrentMember.dontDisturb.remainingTime = null;
    };

    CurrentMember.setDontDisturbTimeout = function (duration) {
      CurrentMember.dontDisturbTimeout = $timeout(function () {
        CurrentMember.removeDontDisturbModeTimeProperties();
        CurrentMember.setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE
          .DEACTIVE);
        $interval.cancel(CurrentMember.dontDisturbInterval);
      }, duration);
    };

    CurrentMember.isDontDisturbModeActive = function () {
      return CurrentMember.dontDisturb.mode === CurrentMember.DONT_DISTURB_MODE
        .ACTIVE;
    };

    CurrentMember.isDontDisturbModeDeactive = function () {
      return CurrentMember.dontDisturb.mode === CurrentMember.DONT_DISTURB_MODE
        .DEACTIVE;
    };

    CurrentMember.isDontDisturbModeTimeActive = function () {
      return CurrentMember.dontDisturb.mode === CurrentMember.DONT_DISTURB_MODE
        .TIMEACTIVE;
    };

    CurrentMember.updateDontDisturbRemainingTime = function () {
      CurrentMember.dontDisturb.remainingTime = CurrentMember.getLocaleDontDisturbRemainingTime();
    };

    CurrentMember.getLocaleDontDisturbRemainingTime = function () {
      var remainingSeconds = (CurrentMember.dontDisturb.duration +
        CurrentMember.dontDisturb
        .startTime - +new Date()) / 1000;
      var minutes = Math.floor(remainingSeconds / 60);
      var seconds = Math.floor(remainingSeconds % 60);
      return textUtil.persianify(seconds.toString() + ' : ' + minutes.toString());
    };

    CurrentMember.DONT_DISTURB_MODE = {
      DEACTIVE: 0,
      ACTIVE: 1,
      TIMEACTIVE: 2
    };

    return CurrentMember;
  }
]);
