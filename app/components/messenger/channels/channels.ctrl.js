'use strict';

app.controller('channelsController', [
  '$rootScope', '$scope', '$state', '$uibModal', 'channelsService',
  'webNotification', 'textUtil',
  function ($rootScope, $scope, $state, $uibModal, channelsService,
    webNotification, textUtil) {

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
      if (!$scope.channels.current) {
        incrementChannelNotification(message.channelId);
      } else {
        var belongsToCurrentChannel =
          message.channelId === $scope.channels.current.id;
        if (!belongsToCurrentChannel && !message.isFromMe()) {
          incrementChannelNotification(message.channelId);
        }
      }
      var channel = channelsService.findChannelById(message.channelId);
      if (channel.hideNotif) {
        channel.hideNotif();
        channel.hideNotif = null;
      }
      if (!$rootScope.isTabFocused)
        notification(channel);

    });

    function notification(channel) {
      webNotification.showNotification(channel.name, {
        body: 'شما ' + channel.getLocaleNotifCount() + ' پیام خوانده نشده دارید',
        icon: 'favicon.png',
        onClick: function onNotificationClicked() {
          channel.hideNotif();
          channel.hideNotif = null;
          window.focus();
          $state.go('messenger.messages', {
            slug: channel.getUrlifiedSlug()
          });
        },
      }, function onShow(error, hide) {
        if (error) {
          window.alert('Unable to show notification: ' + error.message);
        } else {
          channel.hideNotif = hide;
          setTimeout(function hideNotification() {
            channel.hideNotif = null;
            hide(); //manually close the notification (you can skip this if you use the autoClose option)
          }, 5000);
        }
      });
    }

    $scope.openModal = function (name) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: name + 'Modal.html',
        controller: name + 'Controller',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function () {}, function () {});
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
