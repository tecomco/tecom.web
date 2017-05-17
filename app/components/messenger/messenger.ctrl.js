'use strict';

app.controller('MessengerCtrl', [
  '$scope', '$window', '$uibModal', 'AuthService', 'CurrentMember',
  function ($scope, $window, $uibModal, AuthService, CurrentMember) {

    $scope.activeFile = false;
    $scope.isAdmin = CurrentMember.member.isAdmin;
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
        templateUrl: 'app/components/profile/team.profile.view.html',
        controller: 'teamProfileController',
      });
    };

    $scope.$on('view:state:changed', function (event, state) {
      $scope.activeFile = (state === 'noFile') ? false : true;
    });

    $scope.getPannelsCSS = function(pannel){
      if(pannel === 'messages'){
        if($scope.activeFile)
          return 'col-sm-6 col-lg- no-padding';
        else
          return 'col-sm-8 col-lg- no-padding';
      }
      else if(pannel === 'files'){
        if($scope.activeFile)
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

  }
]);
