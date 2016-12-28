'use strict';

app.controller('channelsController', ['$scope', '$state', '$stateParams',
  '$log', '$uibModal', '$localStorage', 'channelsService', 'arrayUtil',
  'Channel', 'messagesService', 'Message',
  function ($scope, $state, $stateParams, $log, $uibModal, $localStorage,
            channelsService, arrayUtil, Channel, messagesService, Message) {

    var $ctrl = this;
    $scope.channels = [];
    $scope.directs = [];
    var channelsAndDirects = [];

    $scope.selectedChat = function () {
      return $stateParams.slug;
    };

    $scope.editedPromise = channelsService.getEditedChannel();
    $scope.newChannelPromise = channelsService.getNewChannel();
    $scope.initChannelsPromise = channelsService.getInitChannels();

    $scope.bindInitChannels = function (allChannels) {
      var directs = [];
      var channels = [];
      allChannels.forEach(function (channel) {
        if (channel.isDirect())
          directs.push(channel);
        else
          channels.push(channel);
      });
      $scope.directs = directs;
      $scope.channels = channels;
      channelsAndDirects = $scope.channels.concat($scope.directs);
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
      if(channel.memberId)
        newChannel.memberId = channel.memberId;
      if(newChannel.isDirect())
        arrayUtil.removeElementByKeyValue($scope.directs, 'slug', newChannel.slug);
      $scope.channels.push(newChannel);
      $log.info($scope.channels);
      $log.info(channelsAndDirects);
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

    $scope.channelClick = function (channel) {
      $log.info('click:', channel);
      //$log.info('this channel:',channel);
    };

    $scope.directClick = function (direct) {
      if (direct.memberId) {
        channelsService.createNewDirectRequest(direct.memberId, direct.slug,
          function (res) {
            if (res.status) {
              $log.info('New Direct Created');
            }
            else
              $log.info('Error Creating New Direct:', res.message);
          });
      }
    };

    var updateNotification = function (channelId, type, notifCount) {
      var channel = channelsAndDirects.find(function (channel) {
        return (channel.id === channelId);
      });
      switch (type) {
        case 'empty':
          channel.notifCount = 0;
          break;
        case 'inc':
          channel.notifCount++;
          break;
        case 'num':
          channel.notifCount = notifCount;
      }
    };

    var updateLastDatetime = function (channelId, datetime) {
      var channel = channelsAndDirects.find(function (channel) {
        return (channel.id === channelId);
      });
      channel.lastDatetime = datetime;
    };

    var findChannel = function (channelId) {
      return channelsAndDirects.find(function (channel) {
        return (channel.id === channelId);
      });
    };

    channelsService.setUpdateNotificationCallback(updateNotification);
    channelsService.setFindChannelCallback(findChannel);
    channelsService.setUpdateLastDatetimeCallback(updateLastDatetime);

    messagesService.setUpdateNotificationCallback(updateNotification);
    messagesService.setFindChannelCallback(findChannel);
    messagesService.setUpdateLastDatetimeCallback(updateLastDatetime);

    Message.setFindChannelCallback(findChannel);


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
