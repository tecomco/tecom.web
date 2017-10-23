/*jshint -W117 */

'use strict';

app.factory('notification', ['$log', '$injector', '$window', '$state', 'ENV',
  function ($log, $injector, $window, $state, ENV) {

    var webNotification;
    if (ENV.isWeb) {
      webNotification = $injector.get('webNotification');
    }

    function sendNotification(channel) {
      if (ENV.isWeb) {
        webNotification.showNotification(channel.name, {
          body: 'شما ' + channel.getLocaleNotifCount() +
            ' پیام خوانده نشده دارید.',
          icon: (ENV.isWeb ? ENV.staticUri + '/' : '') + 'favicon.png',
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
      } else {
        var myNotification = new Notification(channel.name, {
          body: 'شما ' + channel.getLocaleNotifCount() +
            ' پیام خوانده نشده دارید.',
          icon: (ENV.isWeb ? ENV.staticUri + '/' : '') + 'favicon.png'
        });
      }
    }

    return {
      sendNotification: sendNotification,
    };

  }
]);
