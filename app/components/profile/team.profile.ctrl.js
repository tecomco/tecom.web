'use strict';

app.controller('teamProfileController', [
  '$scope', '$log', 'User', 'profileService', '$uibModalInstance', '$timeout',
  'validationUtil',
  function ($scope, $log, User, profileService, $uibModalInstance, $timeout,
            validationUtil) {

    initialize();

    $scope.inviteMember = function () {
      initializeInviteMemberForm();
      $scope.inviteMode = true;
    };

    $scope.sendInvitation = function () {
      if(!$scope.invitedEmail)
        setInfoOrErrorMessage('error', 'لطفا ایمیل رو وارد کن');
      else if (validationUtil.validateEmail($scope.invitedEmail)) {
        profileService.sendInvitationEmail($scope.invitedEmail)
          .then(function () {
            setInfoOrErrorMessage('info', 'ایمیل دعوت به تیم با موفقیت ارسال شد.');
            $scope.inviteMode = false;
          }).catch(function (err) {
          $log.error('Invitation Error:', err);
          if (err.data && err.data[0] === 'Email already a member.')
            setInfoOrErrorMessage('error',
              'فرد مورد نظرت در حال حاضر عضو تیمه');
          else
            setInfoOrErrorMessage('error', 'خطا در دعوت به تیم');
        });
      }
      else
        setInfoOrErrorMessage('error', 'ایمیل وارد شده معتبر نیست');
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

    $scope.removeTeamMember = function (member) {
      profileService.removeTeamMember(member);
    };

    $scope.makeAdmin = function (member) {
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
      User.getCurrent().team.getTeamMembers().then(function (members) {
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
