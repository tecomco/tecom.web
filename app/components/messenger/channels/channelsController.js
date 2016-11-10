'use strict';

app.controller('channelsController', ['$scope', '$state', '$stateParams', '$log',
  '$uibModal', /*'dataBase',*/ 'channelsService', 'arrayUtil',
  function ($scope, $state, $stateParams, $log, $uibModal, /*dataBase,*/ channelsService, arrayUtil) {

    var $ctrl = this;

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

    $ctrl.myPromiss = channelsService.getEditedChannel();

    var doing = function (promiss) {
      promiss.then(function (channel) {
        $log.info('Edit channel then()');
        var index = arrayUtil.getIndexByKeyValue($scope.channels, 'id', channel.id);
        $scope.channels[index] = channel;
        if ($stateParams.channel.id === channel.id) {
          $stateParams.channel = channel;
        }
        promiss = channelsService.getEditedChannel();
      });
    };

    doing($ctrl.myPromiss);

    $scope.$watch(
      function () {
        return $ctrl.myPromiss;
      },
      function handleStateParamChange(newValue, oldValue) {
        doing($ctrl.myPromiss);
      }
    );

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
