 'use strict';

 app.controller('MessengerCtrl', [
   '$rootScope', '$scope', '$window', '$uibModal', 'AuthService',
   'CurrentMember', '$localStorage', '$state', '$http', '$templateCache',
   function ($rootScope, $scope, $window, $uibModal, AuthService,
     CurrentMember, $localStorage, $state, $http, $templateCache) {

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
         templateUrl: 'app/components/profile/team.profile.view.html?v=1.0.3',
         controller: 'teamProfileController',
         resolve: {
           tourClicked: function () {
             return false;
           }
         }
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
         if ($rootScope.activeTool) {
           if ($scope.activeFile)
             return 'col-sm-6 col-lg- no-padding';
           return 'col-sm-8 col-lg- no-padding';
         } else
           return 'col-sm-12 col-lg- no-padding';
       } else if (pannel === 'files') {
         if ($rootScope.activeTool) {
           if ($scope.activeFile)
             return 'col-sm-6 col-lg-6 no-padding doc-section';
           else
             return 'col-sm-4 col-lg- no-padding';
         }
         return '';
       }
     };

     $scope.logout = function () {
       AuthService.logout()
         .then(function () {
           $window.location.href = '/login';
         });
     };

     $scope.getDontDisturbModeClass = function () {
       switch (CurrentMember.dontDisturb.mode) {
         case CurrentMember.DONT_DISTURB_MODE.DEACTIVE:
           return 'zmdi zmdi-notifications-active';
         case CurrentMember.DONT_DISTURB_MODE.ACTIVE:
           return 'zmdi zmdi-notifications-off';
         case CurrentMember.DONT_DISTURB_MODE.TIMEACTIVE:
           return 'zmdi zmdi-notifications-paused';
       }
     };

     $scope.activateTimeDontDisturbMode = function (minute) {
       CurrentMember.activateTimeDontDisturbMode(minute * 60000);
     };

     $scope.activateDontDisturbMode = function () {
       CurrentMember.activateDontDisturbMode();
     };

     $scope.deactivateDontDisturbMode = function () {
       CurrentMember.deactivateDontDisturbMode();
     };

     $scope.getDontDisturbModeRemainingTime = function () {
       return CurrentMember.dontDisturb.remainingTime;
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

     $scope.navigateToHome = function () {
       $state.go('messenger.home');
     };

     $scope.isToolActive = function (toolNum) {
       return toolNum === $rootScope.activeTool;
     };

     $scope.closeToolbar = function () {
       $rootScope.activeTool = null;
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
       CurrentMember.initializeDontDisturbMode();
       cacheMessagesTemplates();
     }

     function cacheMessagesTemplates() {
       $http.get(
         'app/components/messenger/messages/messages.view.html?v=1.1.2', {
           cache: $templateCache
         });
       $http.get('app/components/messenger/header/header.view.html?v=1.0.5', {
         cache: $templateCache
       });
       $http.get('app/components/messenger/toolbar/files/files.view.html', {
         cache: $templateCache
       });
       $http.get(
         'app/components/messenger/toolbar/files/filemanager-files.view.html', {
           cache: $templateCache
         });
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
