'use strict';

app.controller('userProfileController', ['$scope', 'User',
  function($scope, User){

  $scope.user = User;
}]);