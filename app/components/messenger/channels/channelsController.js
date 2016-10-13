'use strict';

app.controller('channelsController', ['$scope', '$state', '$stateParams', '$log',
  '$uibModal', 'dataBase', 'channelsService',
  function ($scope, $state, $stateParams, $log, $uibModal, dataBase, channelsService) {

    var channelType = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };

    $scope.selectedChat = function () {
      return $stateParams.slug;
    };

    $scope.filterByPublicAndPrivate = function (channel) {
      return channel.type === channelType.PUBLIC ||
        channel.type === channelType.PRIVATE;
    };

    $scope.filterByDirect = function (channel) {
      return channel.type === channelType.DIRECT;
    };

    channelsService.getChannels().then(function (data) {
      $scope.channels = data;
      // var channel = $scope.channels.filter(function (channel) {
      //   return (channel.slug === $stateParams.slug);
      // });
      //  $stateParams.channel = channel;
      // $state.go('messenger.messages', {slug: channel.slug, channel: channel[0]}, {notify: false});
    });

    $scope.openCreateChannelModal = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'myModalContent.html',
        controller: 'createChannelController',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function () {
      }, function () {
        $log.info('Modal dismissed at: ' + new Date());
      });
      $log.warn(modalInstance);
      $log.info('New channel modal opened.');
    };

  }
]);
