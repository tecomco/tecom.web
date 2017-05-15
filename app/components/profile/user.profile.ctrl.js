'use strict';

app.controller('userProfileController', [
  '$scope', '$window', 'CurrentMember', 'AuthService', 'profileService', '$uibModalInstance', '$timeout',
  function ($scope, $window, CurrentMember, AuthService, profileService, $uibModalInstance, $timeout) {

    initialize();

    $scope.editUsername = function () {
      $scope.editUsernameActive = true;
    };

    $scope.changePassword = function () {
      clearPasswordFields();
      $scope.changePasswordActive = true;
    };

    $scope.savePassword = function () {
      if ($scope.newPasswordInput !== $scope.confirmPasswordInput)
        setInfoOrErrorMessage('error', 'رمز عبور با تکرار آن مطابقت ندارد.');
      else {
        $scope.changePasswordActive = false;
        profileService.changePassword($scope.oldPasswordInput,
          $scope.newPasswordInput, $scope.confirmPasswordInput).then(function (infoMsg) {
          setInfoOrErrorMessage('info', infoMsg);
        }).catch(function (errorMsg) {
          setInfoOrErrorMessage('error', errorMsg);
        });
      }
    };

    $scope.saveUsername = function () {
      if ($scope.usernameInput === '')
        setInfoOrErrorMessage('error', 'نام کاربری نباید خالی باشد.');
      else if ($scope.usernameInput.length > 16)
        setInfoOrErrorMessage('error', 'نام کاربری حداکثر می تواند ۱۶ کاراکتر باشد.');
      else {
        profileService.changeUsername($scope.usernameInput).then(function (infoMsg) {
          $scope.user.username = $scope.usernameInput;
          setInfoOrErrorMessage('info', infoMsg);
          $scope.editUsernameActive = false;
        }).catch(function (errorMsg) {
          setInfoOrErrorMessage('error', errorMsg);
          $scope.usernameInput = '';
        });
      }
    };

    $scope.uploadProfileImage = function (file, errorFiles) {
      if (file) {
        profileService.changeProfileImage(file).then(function (infoMsg) {
          setInfoOrErrorMessage('info', infoMsg);
        }).catch(function (errorMsg) {
          setInfoOrErrorMessage('error', errorMsg);
        });
      }
    };

    $scope.leaveTeam = function () {
      profileService.removeTeamMember()
        .then(function () {
          return AuthService.logout();
        })
        .then(function () {
          $window.location.href = '/login';
        });
    };

    function setInfoOrErrorMessage(type, message) {
      switch (type) {
        case 'info':
          $scope.infoMessage = message;
          $scope.showInfoMessage = true;
          $timeout(function () {
            $scope.showInfoMessage = false;
            $scope.infoMessage = null;
          }, 5000);
          break;
        case 'error':
          $scope.showErrorMessage = true;
          $scope.errorMessage = message;
          $timeout(function () {
            $scope.showErrorMessage = false;
            $scope.errorMessage = null;
          }, 5000);
          break;
      }
    }

    function clearPasswordFields() {
      $scope.oldPasswordInput = '';
      $scope.newPasswordInput = '';
      $scope.confirmPasswordInput = '';
    }

    function initialize() {
      $scope.user = CurrentMember.member.user;
      $scope.usernameInput = '';
      $scope.editUsernameActive = false;
      $scope.changePasswordActive = false;
      $scope.showErrorMessage = false;
      $scope.showInfoMessage = false;
    }
  }]);
