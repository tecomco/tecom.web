'use strict';

app.controller('messagesController',
  ['$scope', '$state', '$log', '$stateParams', 'User', '$timeout',
    'messagesService', 'Message', 'channelsService',
    function ($scope, $state, $log, $stateParams, User, $timeout,
              messagesService, Message, channelsService) {

      document.getElementById('inputPlaceHolder').focus();
      document.onkeydown = function (evt) {
        evt = evt || window.event;
        if (evt.keyCode == 27) {
          $state.go('messenger.home');
        }
      };
      $scope.messages = [];
      var flagIsTyping = false;
      var timeout;

      function loadMessagesFromDb() {
        var channel = $scope.channel;
        messagesService.isChannelReady(channel.id)
          .then(function () {
            messagesService.getMessagesFromDb($stateParams.channel.id,
              function (messages) {
                messages.forEach(function (msg) {
                  var message = new Message(msg.body, msg.senderId, msg.channelId,
                    msg._id, msg.datetime);
                  addMessageToArray(message);
                });
                $scope.$apply();
              });
            messagesService.getLastMessageFromDb($stateParams.channel.id)
              .then(function (lastMessage) {
                if (lastMessage && channel.notifCount && channel.notifCount > 0) {
                  messagesService.sendSeenNotif(lastMessage.channelId, lastMessage.id,
                    lastMessage.senderId);
                  channelsService.updateNotification(channel.id, 'empty');
                }
                $scope.$apply();
              });
          });
      }

      function updateMessageStatus(messageId, status) {
        var message = $scope.messages.find(function (message) {
          return (message.id === messageId);
        });
        message.status = status;
      }

      function addMessageToArray(message) {
        $scope.messages.push(message);
        $timeout(function () {
          var holder = document.getElementById('messagesHolder');
          holder.scrollTop = holder.scrollHeight;
        }, 0, false);
      }

      $scope.sendMessage = function ($event) {
        $event.preventDefault();
        var messageBody = $scope.inputMessage.trim();
        if (!messageBody) return;
        var message = new Message(messageBody, User.id, $stateParams.channel.id);
        addMessageToArray(message);
        $scope.inputMessage = '';
        messagesService.sendMessage(message.getServerWellFormed(),
          function (data) {
            message.status = Message.STATUS_TYPE.SENT;
            message.updateIdAndDatetime(data.id, data.datetime);
            message.save();
            channelsService.updateLastDatetime(message.channelId, message.datetime);
          });
      };

      $scope.isTyping = function () {
        if (timeout)
          $timeout.cancel(timeout);
        if (flagIsTyping === false) {
          flagIsTyping = true;
          messagesService.sendIsTyping($scope.channel.id, 'start');
        }

        timeout = $timeout(function () {
          flagIsTyping = false;
          messagesService.sendIsTyping($scope.channel.id, 'end');
        }, 2000);

        /*var inputPlaceHolder = document.getElementById('inputPlaceHolder');
         inputPlaceHolder.style.height = '0px';
         inputPlaceHolder.style.height = (inputPlaceHolder.scrollHeight) + 'px';

         var inputHolder = document.getElementById('inputHolder');
         var messagesHolder = document.getElementById('messagesHolder');
         var messageSection = document.getElementById('messageSection');
         messagesHolder.style.height = '-webkit-calc(' + messageSection.scrollHeight + 'px -' + inputHolder.scrollHeight + 'px)';
         console.log(messagesHolder.scrollHeight);*/
      };

      $scope.$watch(
        function () {
          return $stateParams.channel;
        },
        function (newChannel) {
          if (newChannel) {
            if (newChannel) {
              $scope.channel = channelsService.findChannel($stateParams.channel.id);
              loadMessagesFromDb();
            }
          }
        }
      );

      messagesService.setCtrlCallback(addMessageToArray);
      messagesService.setUpdateMessageStatusCallback(updateMessageStatus);
    }
  ]);
