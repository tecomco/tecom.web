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
        initializeInitialJsons();
      else {
        var duration = $localStorage.dontDisturb.duration;
        if (duration)
          checkShouldContinueTimeActive(duration);
        else {
          CurrentMember.dontDisturb.mode = $localStorage.dontDisturb.mode;
        }
      }
    };

    CurrentMember.activateTimeDontDisturbMode = function (miliseconds) {
      setDontDisturbModeTimeProperties(miliseconds);
      setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.TIMEACTIVE);
      setDontDisturbTimeout(miliseconds);
      CurrentMember.dontDisturbInterval = $interval(function () {
        updateDontDisturbRemainingTime();
      }, 1000);
    };

    CurrentMember.activateDontDisturbMode = function () {
      if (CurrentMember.dontDisturb.mode === CurrentMember.DONT_DISTURB_MODE
        .TIMEACTIVE) {
        removeDontDisturbModeTimeProperties();
        $timeout.cancel(CurrentMember.dontDisturbTimeout);
        removeDontDisturbModeRemainingTime();
      }
      setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.ACTIVE);
    };

    CurrentMember.deactivateDontDisturbMode = function () {
      if (CurrentMember.dontDisturb.mode === CurrentMember.DONT_DISTURB_MODE
        .TIMEACTIVE) {
        removeDontDisturbModeTimeProperties();
        $timeout.cancel(CurrentMember.dontDisturbTimeout);
        removeDontDisturbModeRemainingTime();
      }
      setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.DEACTIVE);
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

    function initializeInitialJsons() {
      var initMode = {
        mode: CurrentMember.DONT_DISTURB_MODE.DEACTIVE
      };
      $localStorage.dontDisturb = initMode;
      CurrentMember.dontDisturb.mode = $localStorage.dontDisturb.mode;
    }

    function checkShouldContinueTimeActive(duration) {
      var initTime = +new Date();
      var startTime = $localStorage.dontDisturb.startTime;
      if (initTime - startTime < duration) {
        CurrentMember.activateTimeDontDisturbMode(startTime + duration -
          initTime);
      } else {
        removeDontDisturbModeTimeProperties();
        setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE
          .DEACTIVE);
      }
    }

    function setDontDisturbMode(mode) {
      $localStorage.dontDisturb.mode = mode;
      CurrentMember.dontDisturb.mode = mode;
    }

    function setDontDisturbModeTimeProperties(duration) {
      var startTime = +new Date();
      CurrentMember.dontDisturb.duration = duration;
      $localStorage.dontDisturb.duration = duration;
      CurrentMember.dontDisturb.startTime = startTime;
      $localStorage.dontDisturb.startTime = startTime;
    }

    function removeDontDisturbModeTimeProperties() {
      delete $localStorage.dontDisturb.duration;
      CurrentMember.dontDisturb.duration = null;
      delete $localStorage.dontDisturb.startTime;
      CurrentMember.dontDisturb.startTime = null;
    }

    function removeDontDisturbModeRemainingTime() {
      $interval.cancel(CurrentMember.dontDisturbInterval);
      CurrentMember.dontDisturb.remainingTime = null;
    }

    function setDontDisturbTimeout(duration) {
      CurrentMember.dontDisturbTimeout = $timeout(function () {
        removeDontDisturbModeTimeProperties();
        setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE
          .DEACTIVE);
        $interval.cancel(CurrentMember.dontDisturbInterval);
      }, duration);
    }

    function updateDontDisturbRemainingTime() {
      CurrentMember.dontDisturb.remainingTime =
        getLocaleDontDisturbRemainingTime();
    }

    function getLocaleDontDisturbRemainingTime() {
      var remainingSeconds = (CurrentMember.dontDisturb.duration +
        CurrentMember.dontDisturb
        .startTime - +new Date()) / 1000;
      var minutes = Math.floor(remainingSeconds / 60);
      var seconds = Math.floor(remainingSeconds % 60);
      return textUtil.persianify(seconds.toString() + ' : ' + minutes.toString());
    }

    CurrentMember.DONT_DISTURB_MODE = {
      DEACTIVE: 0,
      ACTIVE: 1,
      TIMEACTIVE: 2
    };

    return CurrentMember;
  }
]);
