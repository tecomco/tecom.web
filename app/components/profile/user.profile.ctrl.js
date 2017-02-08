'use strict';

app.controller('userProfileController', ['$scope', 'User', 'profileService',
  '$uibModalInstance', '$timeout',
  function ($scope, User, profileService, $uibModalInstance, $timeout) {

    initialize();

    $scope.editUsername = function () {
      $scope.editUsernameActive = true;
    };

    $scope.changePassword = function () {
      $scope.changePasswordActive = true;
    };

    $scope.savePassword = function () {
      $scope.changePasswordActive = false;
      profileService.changePassword($scope.oldPasswordInput,
        $scope.newPasswordInput, $scope.confirmPasswordInput).then(function (infoMsg) {
        setInfoOrErrorMessage('info', infoMsg);
      }).catch(function (errorMsg) {
        setInfoOrErrorMessage('error', errorMsg);
      });
    };

    $scope.saveUsername = function () {
      $scope.user.username = $scope.usernameInput;
      profileService.changeUsername($scope.usernameInput).then(function (infoMsg) {
        setInfoOrErrorMessage('info', infoMsg);
      }).catch(function (errorMsg) {
        setInfoOrErrorMessage('error', errorMsg);
      });
      $scope.editUsernameActive = false;
    };

    $scope.closeModal = function () {
      $uibModalInstance.close();
    };

    $scope.uploadProfileImage = function (file, errorFiles) {
      if (file) {
        profileService.changeProfileImage(file).then(function(infoMsg){
          setInfoOrErrorMessage('info', infoMsg);
        }).catch(function(errorMsg){
          setInfoOrErrorMessage('error', errorMsg);
        });
      }
    };

    function setInfoOrErrorMessage(type, message) {
      switch (type) {
        case 'info':
          $scope.infoMessage = message;
          $timeout(function () {
            $scope.infoMessage = null;
          }, 2000);
          break;
        case 'error':
          $scope.errorMessage = message;
          $timeout(function () {
            $scope.errorMessage = null;
          }, 2000);
          break;
      }
    }

    function initialize() {
      $scope.user = User.getCurrent();
      $scope.editUsernameActive = false;
      $scope.changePasswordActive = false;
    }
  }]);