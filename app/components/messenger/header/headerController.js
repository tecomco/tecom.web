'use strict';

app.controller('headerController', [
  '$scope', '$log', '$stateParams', '$localStorage', '$uibModal', '$window',
    'AuthService', 'db', 'channelsService',
  function ($scope, $log, $stateParams, $localStorage, $uibModal, $window,
    AuthService, db, channelsService) {

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
      function (newChannel) {
        if(newChannel) {
          $scope.channel = channelsService.findChannel(newChannel.id);
        }
      }
    );

    $scope.showAndEditChannelDetails = function () {
    };

    $scope.clearCache = function () {
      $localStorage.$reset();
      db.destroy();
      AuthService.logout()
        .then(function () {
          $window.location.href = '/login';
        });
    };
  }
]);
