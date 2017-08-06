'use strict';

app.factory('CurrentMember', ['Member', '$localStorage', '$timeout', 'textUtil',
  '$interval',
  function (Member, $localStorage, $timeout, textUtil, $interval) {

    var timeout;
    var interval;

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
      if (!$localStorage.dontDisturb) {
        var initMode = {
          mode: CurrentMember.DONT_DISTURB_MODE.DEACTIVE
        };
        $localStorage.dontDisturb = initMode;
      }
      CurrentMember.dontDisturb = {};
      var duration = $localStorage.dontDisturb.duration;
      if (duration) {
        var initTime = +new Date();
        var startTime = $localStorage.dontDisturb.startTime;
        if (initTime - startTime < duration)
          CurrentMember.timeActivateDontDisturbMode(startTime + duration -
            initTime);
        else {
          CurrentMember.removeDontDisturbModeTimeProperties();
          CurrentMember.setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE
            .DEACTIVE);
        }
      } else {
        CurrentMember.dontDisturb.mode = $localStorage.dontDisturb.mode;
      }
    };

    CurrentMember.setDontDisturbMode = function (mode) {
      $localStorage.dontDisturb.mode = mode;
      CurrentMember.dontDisturb.mode = mode;
    };

    CurrentMember.timeActivateDontDisturbMode = function (miliseconds) {
      CurrentMember.setDontDisturbModeTimeProperties(miliseconds);
      CurrentMember.setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.TIMEACTIVE);
      CurrentMember.setTimeOutForNotifications(miliseconds);
      interval = $interval(function () {
        CurrentMember.dontDisturbRemainingTime();
      }, 1000);
    };

    CurrentMember.activeDontDisturbMode = function () {
      if (CurrentMember.dontDisturb.mode === CurrentMember.DONT_DISTURB_MODE
        .TIMEACTIVE) {
        CurrentMember.removeDontDisturbModeTimeProperties();
        $timeout.cancel(timeout);
        CurrentMember.removeDontDisturbModeRemainingTime();
      }
      CurrentMember.setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.ACTIVE);
    };

    CurrentMember.deactiveDontDisturbMode = function () {
      if (CurrentMember.dontDisturb.mode === CurrentMember.DONT_DISTURB_MODE
        .TIMEACTIVE) {
        CurrentMember.removeDontDisturbModeTimeProperties();
        $timeout.cancel(timeout);
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
      $interval.cancel(interval);
      CurrentMember.dontDisturb.remainingTime = null;
    };

    CurrentMember.setTimeOutForNotifications = function (duration) {
      timeout = $timeout(function () {
        CurrentMember.removeDontDisturbModeTimeProperties();
        CurrentMember.setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE
          .DEACTIVE);
        $interval.cancel(interval);
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

    CurrentMember.dontDisturbRemainingTime = function () {
      if (!CurrentMember.isDontDisturbModeTimeActive())
        CurrentMember.dontDisturb.remainingTime = null;
      else {
        var seconds = (CurrentMember.dontDisturb.duration + CurrentMember.dontDisturb
          .startTime - +new Date()) / 1000;
        var minute = Math.floor(seconds / 60);
        var second = Math.floor(seconds % 60);
        CurrentMember.dontDisturb.remainingTime = textUtil.persianify(
          second.toString()) + ' : ' + textUtil.persianify(minute.toString());
      }
    };

    CurrentMember.DONT_DISTURB_MODE = {
      DEACTIVE: 0,
      ACTIVE: 1,
      TIMEACTIVE: 2
    };

    return CurrentMember;
  }
]);
