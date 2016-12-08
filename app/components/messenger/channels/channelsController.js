'use strict';

app.controller('channelsController', ['$scope', '$state', '$stateParams',
  '$log', '$uibModal', 'channelsService', 'arrayUtil', 'Channel',
  function ($scope, $state, $stateParams, $log, $uibModal, channelsService,
            arrayUtil, Channel) {

    var $ctrl = this;

    $scope.selectedChat = function () {
      return $stateParams.slug;
    };

    $scope.editedPromise = channelsService.getEditedChannel();
    $scope.newChannelPromise = channelsService.getNewChannel();
    $scope.initChannelsPromise = channelsService.getInitChannels();

    $scope.bindInitChannels = function (data) {
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
        $scope.initChannelsPromise = channelsService.getInitChannels();
      }
    };

    $scope.bindNewChannel = function (channel) {
      $log.info("NewCghannel:", channel);
      /*var newChannel = new Channel(channel.name, channel.slug,
        channel.description, channel.type, channel.id, channel.membersCount,
        null, null, null);
      $scope.channels.push(newChannel);
      $log.info("Channels: ", $scope.channels);*/
      $scope.newChannelPromise = channelsService.getNewChannel();
    };

    $scope.bindEditedChannel = function (channel) {
      $log.info('Edit channel then()');
      var index = arrayUtil.getIndexByKeyValue($scope.channels, 'id', channel.id);
      $scope.channels[index] = channel;
      if ($stateParams.channel.id === channel.id) {
        $state.go('messenger.messages', {
          slug: channel.slug,
          channel: channel
        });
        $log.info('Update URL');
      }
      $scope.editedPromise = channelsService.getEditedChannel();
    };

    $scope.promiseThenFunction = function (promise, thenFunc) {
      promise.then(thenFunc);
    };

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

    $scope.$watch(
      function () {
        return $scope.editedPromise;
      },
      function () {
        $scope.promiseThenFunction($scope.editedPromise, $scope.bindEditedChannel);
      }
    );
    $scope.$watch(
      function () {
        return $scope.newChannelPromise;
      },
      function () {
        $scope.promiseThenFunction($scope.newChannelPromise, $scope.bindNewChannel);
      }
    );
    $scope.$watch(
      function () {
        return $scope.initChannelsPromise;
      },
      function () {
        $scope.promiseThenFunction($scope.initChannelsPromise, $scope.bindInitChannels);
      }
    );
  }
]);
