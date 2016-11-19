'use strict';

app.controller('headerController', [
  '$scope', '$log', '$stateParams', '$localStorage', '$uibModal',
  function ($scope, $log, $stateParams, $localStorage, $uibModal) {

    $scope.openChannelDetailsModal = function () {
      var modalInstance = $uibModal.open({
        templateUrl: 'channelDetailsModal.html',
        controller: 'channelDetailsController',
        controllerAs: '$ctrl',
        resolve: {
          channelInfo: function () {
            return $scope.channel;
          }
        }
      });
      modalInstance.result.then(function () {}, function () {});
    };

    $scope.$watch(
      function () {
        return $stateParams.channel;
      },
      function handleStateParamChange(newValue, oldValue) {
        $scope.channel = $stateParams.channel;
        $log.info('Update Header', $scope.channel);
      }
    );

    $scope.showAndEditChannelDetails = function () {};

    $scope.clearCache = function () {
      $localStorage.$reset();
      $log.info('Local storage cleared.');
    };
  }
]);
