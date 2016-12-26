'use strict';

app.controller('messagesController',
  ['$scope', '$log', '$stateParams', 'User', '$timeout', 'messagesService',
    'Message', 'channelsService',
    function ($scope, $log, $stateParams, User, $timeout, messagesService,
              Message, channelsService) {

      $scope.messages = [];
      function loadMessagesFromDb() {
        var channel = channelsService.findChannel($stateParams.channel.id);
        $log.info("last seen before", channel.channelLastSeen);
        messagesService.isChannelReady(channel.id)
          .then(function () {
            $log.info("last seen after", channel.channelLastSeen);
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

      $scope.sendMessage = function () {
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

      $scope.isTyping = function(){
        // var o = document.getElementById("inputPlaceHolder");
        // o.style.height = "1px";
        // o.style.height = (25+o.scrollHeight)+"px";

        // var a = document.getElementById("inputWrapper");
        // a.style.height = "1px";
        // a.style.height = (25+a.scrollHeight)+"px";
      };

      $scope.$watch(
        function () {
          return $stateParams.channel;
        },
        function (newChannel) {
          if (newChannel) {
            $log.info('New:', newChannel);
            loadMessagesFromDb();
          }
        }
      );

      messagesService.setCtrlCallback(addMessageToArray);
      messagesService.setUpdateMessageStatusCallback(updateMessageStatus);
    }
  ]);
