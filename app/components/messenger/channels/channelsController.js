'use strict';

app.controller('channelsController', ['$scope', '$stateParams', '$log',
  '$uibModal', 'dataBase', 'channelsService',
  function ($scope, $stateParams, $log, $uibModal, dataBase, channelsService) {

    var channelType = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };

    $scope.selectedChat = function () {
      return $stateParams.chatId;
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
    });

    $scope.openCreateChannelModal = function () {
      var modalInstance = $uibModal.open({
        templateUrl: 'myModalContent.html',
        controller: 'createChannelController',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function(){},function(){});
      $log.warn(modalInstance);
      $log.info('New channel modal opened.');
    };

  }
]);
