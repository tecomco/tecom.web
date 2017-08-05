 'use strict';

 app.controller('MessengerCtrl', [
   '$rootScope', '$scope', '$window', '$uibModal', 'AuthService',
   'CurrentMember', '$localStorage', '$timeout', '$interval',
   function ($rootScope, $scope, $window, $uibModal, AuthService,
     CurrentMember, $localStorage, $timeout, $interval) {

     $scope.isAdmin = CurrentMember.member.isAdmin;
     $rootScope.isTabFocused = true;
     $scope.activeFile = false;

     $scope.openUserProfileModal = function () {
       var modalInstance = $uibModal.open({
         animation: true,
         templateUrl: 'app/components/profile/user.profile.view.html',
         controller: 'userProfileController',
       });
     };

     $scope.openTeamProfileModal = function () {
       var modalInstance = $uibModal.open({
         animation: true,
         templateUrl: 'app/components/profile/team.profile.view.html?v=1.0.0',
         controller: 'teamProfileController',
       });
     };

     initialize();

     $scope.$on('view:state:changed', function (event, state) {
       $scope.activeFile = (state === 'noFile') ? false : true;
     });

     $scope.$on('loading:finished', function () {
       checkIfUserSeenTour();
     });

     $scope.getPannelsCSS = function (pannel) {
       if (pannel === 'messages') {
         if ($scope.activeFile)
           return 'col-sm-6 col-lg- no-padding';
         else
           return 'col-sm-8 col-lg- no-padding';
       } else if (pannel === 'files') {
         if ($scope.activeFile)
           return 'col-sm-6 col-lg-6 no-padding doc-section';
         else
           return 'col-sm-4 col-lg- no-padding';
       }
     };

     $scope.logout = function () {
       AuthService.logout()
         .then(function () {
           $window.location.href = '/login';
         });
     };

     $scope.getNotifIconClass = function () {
       if (CurrentMember.dontDisturbMode === CurrentMember.DONT_DISTURB_MODE
         .DEACTIVE)
         return 'zmdi zmdi-notifications-active';
       else if (CurrentMember.dontDisturbMode === CurrentMember.DONT_DISTURB_MODE
         .ACTIVE)
         return 'zmdi zmdi-notifications-none';
       else if (CurrentMember.dontDisturbMode === CurrentMember.DONT_DISTURB_MODE
         .TIMEACTIVE)
         return 'zmdi zmdi-notifications-add';
     };

     $scope.setDontDisturbModeTime = function (minute) {
       setDontDisturbModeTime(minute * 60000);
     };

     $scope.setDontDisturbActive = function () {
       var time = $localStorage.dontDisturbModeTime;
       if (time)
         removeDontDisturbModeTimeProperties();
       setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.ACTIVE);
     };

     $scope.setDontDisturbDeactive = function () {
       var time = $localStorage.dontDisturbModeTime;
       if (time)
         removeDontDisturbModeTimeProperties();
       setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.DEACTIVE);
     };

     $scope.setNotificationPermission = function () {
       if ($window.Notification.permission === 'default')
         $window.Notification.requestPermission();
       else if ($window.Notification.permission === 'denied')
         $window.Notification.requestPermission();
       // TODO:create modal for instruction to reenable this boi
     };

     $scope.shouldShowNotificationPermission = function () {
       return $window.Notification.permission !== 'granted';
     };

     function initialize() {
       $window.Notification.requestPermission();
       var initTime = +new Date();
       var time = $localStorage.dontDisturbModeTime;
       var startTime = $localStorage.dontDisturbModeStartTime;
       if (time) {
         if (initTime - startTime < time)
           setDontDisturbModeTime(startTime + time - initTime);
         else {
           removeDontDisturbModeTimeProperties();
           setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.DEACTIVE);
         }
       } else {
         CurrentMember.dontDisturbMode = CurrentMember.getDontDisturbModeStatus();
       }
     }

     function setTimeOutForNotifications(time) {
       $timeout(function () {
         removeDontDisturbModeTimeProperties();
         setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.DEACTIVE);
       }, time);
     }

     function setDontDisturbModeTime(miliseconds) {
       setDontDisturbModeTimeProperties(miliseconds);
       setDontDisturbMode(CurrentMember.DONT_DISTURB_MODE.TIMEACTIVE);
       setTimeOutForNotifications(miliseconds);
     }

     function setDontDisturbModeTimeProperties(time) {
       var startTime = +new Date();
       CurrentMember.dontDisturbModeTime = time;
       $localStorage.dontDisturbModeTime = time;
       CurrentMember.dontDisturbModeStartTime = startTime;
       $localStorage.dontDisturbModeStartTime = startTime;
     }

     function removeDontDisturbModeTimeProperties() {
       delete $localStorage.dontDisturbModeTime;
       CurrentMember.dontDisturbModeTime = null;
       delete $localStorage.dontDisturbModeStartTime;
       CurrentMember.dontDisturbModeStartTime = null;
     }

     function setDontDisturbMode(mode) {
       $localStorage.dontDisturbMode = mode;
       CurrentMember.dontDisturbMode = mode;
     }

     function checkIfUserSeenTour() {
       if (!$localStorage.userSeenTour) {
         $scope.tour.start();
         $localStorage.userSeenTour = true;
       }
     }

     angular.element($window)
       .bind('focus', function () {
         $rootScope.isTabFocused = true;
         $rootScope.$broadcast('tab:focus:changed');
       }).bind('blur', function () {
         $rootScope.isTabFocused = false;
         $rootScope.$broadcast('tab:focus:changed');
       });

   }
 ]);
