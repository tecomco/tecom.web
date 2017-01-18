'use strict';

app.controller('channelsController', ['$scope', '$state', '$stateParams',
  '$log', '$uibModal', '$localStorage', 'channelsService', 'arrayUtil',
  'Channel', 'messagesService', 'Message',
  function ($scope, $state, $stateParams, $log, $uibModal, $localStorage,
            channelsService, arrayUtil, Channel, messagesService, Message) {

    var $ctrl = this;
    $scope.channels = [];
    $scope.directs = [];
    var isTabFocused = true;

    $scope.selectedChat = function () {
      if (!$stateParams.channel) return false;
      return $stateParams.channel.type === Channel.TYPE.DIRECT ?
      '@' + $stateParams.channel.slug : $stateParams.channel.slug;
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
      var channelsAndDirects = $scope.channels.concat($scope.directs);
      if ($stateParams.slug) {
        var tmpSlug = $stateParams.slug.replace('@', '');
        var tmpChannel = channelsAndDirects.find(function (channel) {
          return (channel.slug === tmpSlug);
        });
        if (!tmpChannel) {
          $state.go('messenger.home');
        }
        $stateParams.channel = tmpChannel;
        $localStorage.currentChannel = tmpChannel;
        $scope.initChannelsPromise = channelsService.getInitChannels();
      }
    };

    $scope.bindNewChannel = function (channel) {
      var newChannel = new Channel(channel.name, channel.slug,
        channel.description, channel.type, channel.id, channel.membersCount);
      if (channel.memberId)
        newChannel.memberId = channel.memberId;
      if (newChannel.isDirect()) {
        newChannel.changeNameAndSlugFromId();
        var direct = findFakeDirect(newChannel.slug);
        direct.updateNewDirectData(newChannel);
        $state.go("messenger.messages", {
          slug: '@' + direct.slug,
          channel: direct
        });
      }
      else {
        $scope.channels.push(newChannel);
      }
      $scope.newChannelPromise = channelsService.getNewChannel();
    };

    $scope.bindEditedChannel = function (editedChannel) {
      var channel = findChannel(editedChannel.id);
      channel.updateFromJson(editedChannel);
      if ($stateParams.channel.id === channel.id) {
        $state.go('messenger.messages', {
          slug: channel.slug,
          channel: channel
        });
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
    };

    $scope.directClick = function (direct) {
      $stateParams.channel = direct;
      $stateParams.slug = direct.slug;
    };

    var updateNotification = function (channelId, type, notifCount) {
      var channel = findChannel(channelId);
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
      if (!$scope.$$phase) {
        $scope.$apply();
      }
    };

    var updateLastDatetime = function (channelId, datetime) {
      var channel = findChannel(channelId);
      channel.lastDatetime = datetime;
    };

    var findChannel = function (channelId) {
      var channelsAndDirects = $scope.channels.concat($scope.directs);
      return channelsAndDirects.find(function (channel) {
        return (channel.id === channelId);
      });
    };

    var findFakeDirect = function (directSlug) {
      var index = arrayUtil.getIndexByKeyValue($scope.directs, 'slug', directSlug);
      return $scope.directs[index];
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

    function handleDirectCreating() {
      $scope.$watch(
        function () {
          return $stateParams.channel;
        },
        function (channel) {
          if (channel) {
            if (channel.type === Channel.TYPE.DIRECT) {
              var direct = findFakeDirect(channel.slug);
              if (direct.memberId) {
                channelsService.createNewDirectRequest(direct.memberId,
                  function (res) {
                    if (res.status) {
                      $log.info('New Direct Created');
                    }
                    else
                      $log.info('Error Creating New Direct:', res.message);
                  });
              }
              else
                $state.go('messenger.messages', {
                  slug: '@' + direct.slug,
                  channel: direct
                });
            }
          }
        }
      );
    };
    handleDirectCreating();
  }
]);
