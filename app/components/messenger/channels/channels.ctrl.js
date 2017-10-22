/*jshint -W117 */
/*jshint esversion: 6 */

'use strict';

app.controller('channelsController', [
  '$rootScope', '$scope', '$window', '$state', '$uibModal',
  'channelsService', '$log', 'ENV', 'notification',
  function ($rootScope, $scope, $window, $state, $uibModal, channelsService,
    $log, ENV, notification) {

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
      var channel = channelsService.findChannelById(message.channelId);
      if (!$rootScope.isTabFocused) {
        incrementChannelNotification(message.channelId);
        if (channel.shouldSendNotification())
          notification.sendNotification(channel);
      } else {
        if (!$scope.channels.current) {
          incrementChannelNotification(message.channelId);
        } else {
          var belongsToCurrentChannel =
            message.channelId === $scope.channels.current.id;
          if (!belongsToCurrentChannel && !message.isFromMe()) {
            incrementChannelNotification(message.channelId);
          }
        }
      }
    });

    $scope.openTeamProfileModal = function () {
      var tourClicked = false;
      if ($scope.tour.getStatus() === $scope.tour.Status.ON) {
        tourClicked = true;
        $scope.tour.end();
      }
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/components/profile/team.profile.view.html?v=1.0.1',
        controller: 'teamProfileController',
        resolve: {
          tourClicked: function () {
            return tourClicked;
          }
        }
      });
    };

    $scope.openCreateChannelModal = function (name) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/components/messenger/channels/channel-create.view.html?v=1.0.1',
        controller: 'createChannelController'
      });
      modalInstance.result
        .then(function () {}, function () {});
    };

    $scope.navigateToAndWaitFor = function (stepId) {
      if ($scope.channels.publicsAndPrivates.length) {
        $state.go('messenger.messages', {
          slug: $scope.channels.publicsAndPrivates[0].slug
        });
        return $scope.tour.waitFor(stepId);
      }
    };

    $scope.scrollToDirects = function () {
      document.getElementById('groups').scrollTop = document.getElementById(
        'channels').scrollHeight;
    };

    $scope.navigateToHomeAndScrollToChannels = function () {
      $state.go('messenger.home');
      document.getElementById('groups').scrollTop = 0;
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
      if (!ENV.isWeb) {
        const {
          ipcRenderer
        } = require('electron');
        if ($rootScope.hasUnread)
          ipcRenderer.send('message:unread');
        else
          ipcRenderer.send('message:read');
      }
    }

    function incrementChannelNotification(channelId) {
      channelsService.updateChannelNotification(channelId, 'inc');
    }

  }
]);
