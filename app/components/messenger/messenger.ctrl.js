'use strict';

app.controller('MessengerCtrl', ['$scope', '$window', '$uibModal',
  'AuthService', 'User',
  function ($scope, $window, $uibModal, AuthService, User) {

    $scope.isAdmin = User.getCurrent().isAdmin;
    $scope.openModal = function (name) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: name + '.html',
        controller: name + 'Controller',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function () {}, function () {});
    };

    $scope.logout = function () {
      AuthService.logout()
        .then(function () {
          $window.location.href = '/login';
        });
    };

  }
]);
