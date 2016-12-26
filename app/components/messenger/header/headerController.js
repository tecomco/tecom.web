'use strict';

app.controller('headerController', [
  '$scope', '$log', '$stateParams', '$localStorage', '$uibModal', 'db',
  'channelsService',
  function ($scope, $log, $stateParams, $localStorage, $uibModal, db,
            channelsService) {

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
      modalInstance.result.then(function () {
      }, function () {
      });
    };

    $scope.$watch(
      function () {
        return $stateParams.channel;
      },
      function () {
        $scope.channel = channelsService.findChannel($stateParams.channel.id);
      }
    );

    $scope.showAndEditChannelDetails = function () {
    };

    $scope.clearCache = function () {
      $localStorage.$reset();
      $log.info('Local storage cleared.');
      db.destroy();
    };
  }
]);
