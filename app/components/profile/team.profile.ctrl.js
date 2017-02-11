'use strict';

app.controller('teamProfileController', [
  '$scope', 'User', 'profileService', '$uibModalInstance', '$timeout',
  function ($scope, User, profileService, $uibModalInstance, $timeout) {

  initialize();

  $scope.inviteMember = function () {
    initializeInviteMemberForm();
    $scope.inviteMode = true;
  };

  $scope.sendInvitation = function () {
    profileService.sendInvitationEmail($scope.invitedEmail)
      .then(function () {
        setInfoOrErrorMessage('info', 'ایمیل دعوت به تیم با موفقیت ارسال شد.');
        $scope.inviteMode = false;
      }).catch(function(){
        setInfoOrErrorMessage('error', 'خطا در دعوت به تیم.');
    });
  };

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
          $scope.showInfoMessage = true;
          $timeout(function () {
            $scope.showInfoMessage = false;
            $scope.infoMessage = null;
          }, 4000);
          break;
        case 'error':
          $scope.showErrorMessage = true;
          $scope.errorMessage = message;
          $timeout(function () {
            $scope.showErrorMessage = false;
            $scope.errorMessage = null;
          }, 4000);
          break;
      }
    }

  function initialize() {
    User.getCurrent().team.getTeamMembers().then(function(members){
      $scope.teamMembers = members;
    });
    $scope.team = User.getCurrent().team;
    $scope.editTeamNameActive = false;
    $scope.inviteMode = false;
    $scope.forms = {};
  }

  function initializeInviteMemberForm() {
    $scope.invitedEmail = '';
    $scope.forms.inviteMember.$setPristine();
  }

}]);
