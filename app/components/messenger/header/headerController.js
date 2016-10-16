'use strict';

app.controller('headerController', ['$scope', '$log', '$stateParams', '$uibModal',
  function ($scope, $log, $stateParams, $uibModal) {

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
      $log.info('Channel details modal opened.');
    };

    $scope.$watch(
      function () {
        return $stateParams.channel
      },
      function handleFooChange(newValue, oldValue) {
        $scope.channel = $stateParams.channel;
      }
    );

    $scope.showAndEditChannelDetails = function () {
      $log("Details");
    };
  }
]);
