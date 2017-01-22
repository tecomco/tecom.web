'use strict';

app.controller('channelsController',
  ['$scope', '$state', '$stateParams', '$uibModal', 'channelsService',
  function ($scope, $state, $stateParams, $uibModal, channelsService) {

    $scope.channels = {};
    $scope.channels.publicsAndPrivates = [];
    $scope.channels.directs = [];

    $scope.$on('channels:updated', function (event, data) {
      $scope.channels.publicsAndPrivates =
        channelsService.getPublicsAndPrivates();
      $scope.channels.directs = channelsService.getDirects();
      if (data === 'init') {
        validateUrlChannel();
      }
    });

    $scope.$on('channel:changed', function () {
      $scope.channels.current = channelsService.getCurrentChannel();
    });

    $scope.$on('message', function (event, message) {
      if (!$scope.channels.current) {
        incrementChannelNotification(message.channelId);
      } else {
        var belongsToCurrentChannel =
          message.channelId === $scope.channels.current.id;
        if (!belongsToCurrentChannel && !message.isFromMe()) {
          incrementChannelNotification(message.channelId);
        }
      }
    });

    $scope.openModal = function (name) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: name + 'Modal.html',
        controller: name + 'Controller',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function () {}, function () {});
    };

    function validateUrlChannel() {
      if (!$scope.channels.current) {
        $state.go('messenger.home');
      }
    }

    function incrementChannelNotification(channelId) {
      channelsService.updateChannelNotification(channelId, 'inc');
    }

  }
]);
