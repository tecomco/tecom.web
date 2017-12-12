'use strict';

app.controller('headerController', ['$scope', '$rootScope', '$localStorage',
  '$uibModal', '$window', 'AuthService', 'Db', 'channelsService', '$state',
  function ($scope, $rootScope, $localStorage, $uibModal, $window,
    AuthService, Db, channelsService, $state) {

    $scope.searchFocus = false;

    $scope.$on('channel:changed', function () {
      $scope.channel = channelsService.getCurrentChannel();
    });

    $scope.toggleIsMuted = function () {
      channelsService.toggleIsMuted($scope.channel.id);
    };

    $scope.openChannelDetailsModal = function () {
      if ($scope.channel) {
        var channelDetailsModal = $uibModal.open({
          templateUrl: 'app/components/messenger/channels/channel-details.view.html?v=1.0.2',
          controller: 'channelDetailsController'
        });
        channelDetailsModal.opened
          .then(function () {
            $rootScope.isAnyModalOpen = true;
          });
        channelDetailsModal.closed
          .then(function () {
            $rootScope.isAnyModalOpen = false;
          });
      }
    };

    $scope.clearCache = function () {
      $localStorage.$reset();
      Db.destroy();
      AuthService.logout()
        .then(function () {
          $window.location.href = '/login';
        });
    };

    $scope.searchFocused = function () {
      $scope.searchFocus = true;
    };

    $scope.searchBlurred = function () {
      $scope.searchFocus = false;
    };

  }
]);
