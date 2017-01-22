'use strict';

app.controller('channelsController',
  ['$scope', '$state', '$stateParams', '$uibModal', 'channelsService',
  function ($scope, $state, $stateParams, $uibModal, channelsService) {

    $scope.channels = {};
    $scope.channels.publicsAndPrivates = [];
    $scope.channels.directs = [];

    $scope.$on('channels:updated', function () {
      $scope.channels.publicsAndPrivates =
        channelsService.getPublicsAndPrivates();
      $scope.channels.directs = channelsService.getDirects();
      validateUrlChannel();
    });

    $scope.$on('message', function (event, message) {
      var belongsToCurrentChannel = message.channelId === $scope.channels.current.id;
      if (!belongsToCurrentChannel && !message.isFromMe()) {
        channelsService.updateChannelNotification(message.channelId, 'inc');
      }
    });

    function validateUrlChannel() {
      if ($stateParams.slug) {
        var slug = $stateParams.slug.replace('@', '');
        var channel = channelsService.findChannelBySlug(slug);
        if (!channel) {
          $state.go('messenger.home');
        } else {
          $scope.channels.current = channel;
        }
      }
    }

    $scope.openModal = function (name) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: name + 'Modal.html',
        controller: name + 'Controller',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function () {}, function () {});
    };

  }
]);
