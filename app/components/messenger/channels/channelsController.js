'use strict';

app.controller('channelsController', ['$scope', '$state', '$stateParams', '$log',
  '$uibModal', /*'dataBase',*/ 'channelsService',
  function ($scope, $state, $stateParams, $log, $uibModal, /*dataBase,*/ channelsService) {

    $scope.channelType = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };

    $scope.selectedChat = function () {
      return $stateParams.slug;
    };

    $scope.filterByPublicAndPrivate = function (channel) {
      return channel.type === $scope.channelType.PUBLIC ||
        channel.type === $scope.channelType.PRIVATE;
    };

    $scope.filterByDirect = function (channel) {
      return channel.type === $scope.channelType.DIRECT;
    };

    channelsService.getChannels().then(function (data) {
      $scope.channels = data;
      if ($stateParams.slug !== null && $stateParams.slug !== undefined) {
        var tmpSlug = $stateParams.slug.replace('@', '');
        var tmpChannel = $scope.channels.find(function (channel) {
          return (channel.slug === tmpSlug);
        });
        if (tmpSlug === undefined) {
          // channelsService.checkIfSlugIsValid($stateParams.slug)
        }
        $stateParams.channel = tmpChannel;
      }
    });

    channelsService.getNewChannel().then(function (data) {
      $scope.channels.push(data);
    });

    $scope.openCreateChannelModal = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'createNewChannelModal.html',
        controller: 'createChannelController',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function () {
      }, function () {
      });
    };

    $scope.openNewDirectModal = function () {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'newDirectModal.html',
        controller: 'newDirectController',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function () {
      }, function () {
      });
    };

  }
]);
