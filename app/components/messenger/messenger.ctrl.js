'use strict';

app.controller('MessengerCtrl', ['$scope', '$uibModal',
  function ($scope, $uibModal) {

    $scope.openModal = function (name) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: name + '.html',
        controller: name + 'Controller',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function () {}, function () {});
    };

  }
]);
