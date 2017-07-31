 'use strict';

 app.controller('MessengerCtrl', [
   '$rootScope', '$scope', '$window', '$uibModal', 'AuthService',
   'CurrentMember', '$localStorage',
   function ($rootScope, $scope, $window, $uibModal, AuthService,
     CurrentMember, $localStorage) {

     if (CurrentMember.isReady) {
       $scope.dontDisturbMode = CurrentMember.dontDisturbMode;
       $scope.isAdmin = CurrentMember.member.isAdmin;
     } else {
       AuthService.initialize().then(function () {
         $scope.dontDisturbMode = CurrentMember.dontDisturbMode;
         $scope.isAdmin = CurrentMember.member.isAdmin;
       });
     }
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

     $scope.toggleDontDisturbMode = function () {
       CurrentMember.dontDisturbMode = $scope.dontDisturbMode;
       $localStorage.dontDisturbMode = $scope.dontDisturbMode;
     };

     $scope.logout = function () {
       AuthService.logout()
         .then(function () {
           $window.location.href = '/login';
         });
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

     angular.element($window)
       .bind('focus', function () {
         $rootScope.isTabFocused = true;
         $rootScope.$broadcast('tab:focus:changed');
       }).bind('blur', function () {
         $rootScope.isTabFocused = false;
         $rootScope.$broadcast('tab:focus:changed');
       });

     function initialize() {
       $window.Notification.requestPermission();
     }

     function checkIfUserSeenTour() {
       if (!$localStorage.userSeenTour) {
         $scope.tour.start();
         $localStorage.userSeenTour = true;
       }
     }

   }
 ]);
