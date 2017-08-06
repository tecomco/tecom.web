'use strict';

app.controller('headerController',
  ['$scope', '$localStorage', '$uibModal', '$window', 'AuthService', 'db',
    'channelsService', '$state',
    function ($scope, $localStorage, $uibModal, $window, AuthService, db,
              channelsService, $state) {

      $scope.$on('channel:changed', function () {
        $scope.channel = channelsService.getCurrentChannel();
        console.log($scope.channel);
        $scope.isMuted = $scope.channel.isMuted;
      });

      $scope.toggleisMuted = function () {
        $scope.channel.isMuted = $scope.isMuted;
        channelsService.toggleisMuted($scope.channel.id);
      };

      $scope.openChannelDetailsModal = function () {
        if ($scope.channel) {
          var modalInstance = $uibModal.open({
            templateUrl: 'app/components/messenger/channels/channel-details.view.html?v=1.0.1',
            controller: 'channelDetailsController'
          });
        }
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
