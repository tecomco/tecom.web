'use strict';

app.controller('userProfileController', ['$scope', 'User', 'profileService',
  function ($scope, User, profileService) {

    initialize();

    $scope.editUsername = function () {
      $scope.editUsernameActive = true;
    };

    $scope.saveUsername = function () {
      $scope.user.username = $scope.usernameInput;
      profileService.changeUsername($scope.usernameInput);
      $scope.editUsernameActive = false;

    };



    function initialize() {
      $scope.user = User;
      $scope.editUsernameActive = false;
    }
  }]);