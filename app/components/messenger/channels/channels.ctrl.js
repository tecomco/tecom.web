'use strict';

app.controller('channelsController', [
  '$rootScope', '$scope', '$state', '$uibModal', 'channelsService',
  function ($rootScope, $scope, $state, $uibModal, channelsService) {

    $scope.channels = {};
    $scope.channels.publicsAndPrivates = [];
    $scope.channels.directs = [];

    $scope.$on('channels:updated', function () {
      updateChannels();
      updateFavicon();
    });

    $scope.$on('channel:changed', function () {
      $scope.channels.current = channelsService.getCurrentChannel();
      validateUrlChannel();
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

    $scope.channelClick = function (channel) {
      $state.go('messenger.messages', {
        slug: channel.getUrlifiedSlug()
      });
    };

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

    function updateChannels() {
      $scope.channels.publicsAndPrivates =
        channelsService.getPublicsAndPrivates();
      $scope.channels.directs = channelsService.getDirects();
    }

    function updateFavicon() {
      $rootScope.hasUnread = channelsService.anyChannelHasUnread();
    }

    function incrementChannelNotification(channelId) {
      channelsService.updateChannelNotification(channelId, 'inc');
    }

  }
]);
