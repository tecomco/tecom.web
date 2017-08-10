'use strict';

app.controller('channelsController', [
  '$rootScope', '$scope', '$window', '$state', '$uibModal', '$q',
  'channelsService', 'webNotification', 'textUtil', '$log', 'CurrentMember',
  function ($rootScope, $scope, $window, $state, $uibModal, $q,
    channelsService, webNotification, textUtil, $log, CurrentMember) {

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
          sendBrowserNotification(channel);
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

    $scope.openTeamProfileModal = function (tour) {
      var tourClicked = false;
      if (tour.getStatus() === tour.Status.ON) {
        tourClicked = true;
        tour.end();
      }
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/components/profile/team.profile.view.html?v=1.0.0',
        controller: 'teamProfileController',
        resolve: {
          tourClicked: function () {
            return tourClicked;
          }
        }
      });
    };

    function sendBrowserNotification(channel) {
      webNotification.showNotification(channel.name, {
        body: 'شما ' + channel.getLocaleNotifCount() +
          ' پیام خوانده نشده دارید.',
        icon: 'favicon.png',
        onClick: function onNotificationClicked() {
          channel.hideNotifFunction();
          channel.hideNotifFunction = null;
          $window.focus();
          $state.go('messenger.messages', {
            slug: channel.getUrlifiedSlug()
          });
        },
      }, function onShow(error, hide) {
        if (error) {
          $log.error('Unable to show notification: ' + error.message);
        } else {
          channel.hideNotifFunction = hide;
          setTimeout(function hideNotifFunctionication() {
            channel.hideNotifFunction = null;
            hide();
          }, 5000);
        }
      });
    }

    $scope.openCreateChannelModal = function (name) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'app/components/messenger/channels/channel-create.view.html?v=1.0.1',
        controller: 'createChannelController'
      });
      modalInstance.result.then(function () {}, function () {});
    };

    $scope.navigateToAndWaitFor = function (tour, stepId) {
      if ($scope.channels.publicsAndPrivates.length) {
        $state.go('messenger.messages', {
          slug: $scope.channels.publicsAndPrivates[0].slug
        });
        return tour.waitFor(stepId);
      }
    };

    $scope.navigateToHome = function () {
      $state.go('messenger.home');
    };

    $scope.scrollToDirects = function () {
      document.getElementById('groups').scrollTop = document.getElementById(
        'channels').scrollHeight;
    };

    $scope.scrollToChannels = function () {
      document.getElementById('groups').scrollTop = 0;
    };

    $scope.scrollToProgress = function () {
      var groups = document.getElementById('groups');
      groups.scrollTop = groups.scrollHeight;
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
    }

    function incrementChannelNotification(channelId) {
      channelsService.updateChannelNotification(channelId, 'inc');
    }

  }
]);
