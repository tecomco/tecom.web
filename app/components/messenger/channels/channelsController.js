'use strict';

app.controller('channelsController', ['$scope', '$state', '$stateParams',
  '$log', '$uibModal', '$localStorage', 'channelsService', 'arrayUtil',
  'Channel',
  function ($scope, $state, $stateParams, $log, $uibModal, $localStorage
    ,channelsService, arrayUtil, Channel) {

    var $ctrl = this;
    $scope.channels = [];
    $scope.directs = [];

    $scope.selectedChat = function () {
      return $stateParams.slug;
    };

    $scope.editedPromise = channelsService.getEditedChannel();
    $scope.newChannelPromise = channelsService.getNewChannel();
    $scope.initChannelsPromise = channelsService.getInitChannels();

    $scope.bindInitChannels = function (allChannels) {
      allChannels.forEach(function(channel){
        if(channel.isDirect())
          $scope.directs.push(channel);
        else
          $scope.channels.push(channel);
      });
      var channelsAndDirects = $scope.channels.concat($scope.directs);
      if ($stateParams.slug) {
        var tmpSlug = $stateParams.slug.replace('@', '');
        var tmpChannel = channelsAndDirects.find(function (channel) {
          return (channel.slug === tmpSlug);
        });
        $stateParams.channel = tmpChannel;
        $localStorage.currentChannel = tmpChannel;
        $scope.initChannelsPromise = channelsService.getInitChannels();
      }
    };

    $scope.bindNewChannel = function (channel) {
      $log.info("NewChannel:", channel);
      var newChannel = new Channel(channel.name, channel.slug,
        channel.description, channel.type, channel.id, channel.membersCount);
      $scope.channels.push(newChannel);
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

    $scope.channelClick = function(channel){
      $localStorage.currentChannel = channel;
      channel.sendSeenStatusToServer();
      $log.info('channel:', channel);
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
