'use strict';

app.controller('headerController',
  ['$scope', '$localStorage', '$uibModal', '$window', 'AuthService', 'db',
    'channelsService', '$state',
    function ($scope, $localStorage, $uibModal, $window, AuthService, db,
              channelsService, $state) {

      $scope.$on('channel:changed', function () {
        $scope.channel = channelsService.getCurrentChannel();
      });

      $scope.openChannelDetailsModal = function () {
        if ($scope.channel) {
          var modalInstance = $uibModal.open({
            templateUrl: 'app/components/messenger/channels/channel-details.view.html',
            controller: 'channelDetailsController',
            controllerAs: '$ctrl'
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
