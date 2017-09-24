'use strict';

app.controller('headerController', ['$scope', '$localStorage', '$uibModal',
  '$window', 'AuthService', 'Db', 'channelsService', '$state',
  function ($scope, $localStorage, $uibModal, $window, AuthService, Db,
    channelsService, $state) {

    $scope.searchFocus = false;

    $scope.$on('channel:changed', function () {
      $scope.channel = channelsService.getCurrentChannel();
    });

    $scope.toggleIsMuted = function () {
      channelsService.toggleIsMuted($scope.channel.id);
    };

    $scope.openChannelDetailsModal = function () {
      if ($scope.channel) {
        var modalInstance = $uibModal.open({
          templateUrl: 'app/components/messenger/channels/channel-details.view.html?v=1.0.2',
          controller: 'channelDetailsController'
        });
      }
    };

    $scope.searchFocused = function () {
      $scope.searchFocus = true;
    };

    $scope.searchBlurred = function () {
      $scope.searchFocus = false;
    };

  }
]);
