'use strict';

app.controller('teamProfileController', ['$scope', 'User', 'profileService',
  '$uibModalInstance', '$timeout',
  function ($scope, User, profileService, $uibModalInstance, $timeout) {

  initialize();

  $scope.editTeamName = function () {
    $scope.editTeamNameActive = true;
  };

  $scope.saveTeamName = function () {
    $scope.editTeamNameActive = false;
  };

  $scope.closeModal = function () {
    $uibModalInstance.close();
  };

  $scope.removeTeamMember = function(member){
    profileService.removeTeamMember(member);
  };

  $scope.makeAdmin = function(member){
    profileService.makeAdmin(member);
  };

  function setInfoOrErrorMessage(type, message) {
    switch (type) {
      case 'info':
        $scope.infoMessage = message;
        $timeout(function () {
          $scope.infoMessage = null;
        }, 4000);
        break;
      case 'error':
        $scope.errorMessage = message;
        $timeout(function () {
          $scope.errorMessage = null;
        }, 4000);
        break;
    }
  }

  function initialize() {
    User.getCurrent().team.getTeamMembers().then(function(members){
      console.log(members);
      $scope.teamMembers = members;
    });
    $scope.team = User.getCurrent().team;
    $scope.editTeamNameActive = false;
  }
}]);