'use strict';

app.controller('headerController', ['$scope', '$log', '$uibModal',
  function ($scope, $log, $uibModal) {

    $scope.openChannelDetailsModal = function () {
      var modalInstance = $uibModal.open({
        templateUrl: 'channelDetailsModal.html',
        controller: 'channelDetailsController',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function () {}, function () {});
      $log.info('Channel details modal opened.');
    };

  }
]);
