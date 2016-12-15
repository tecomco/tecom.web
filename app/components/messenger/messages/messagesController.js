'use strict';

app.controller('messagesController',
  ['$scope', '$log', '$stateParams', 'User', '$timeout', 'messagesService',
    'Message',
    function ($scope, $log, $stateParams, User, $timeout, messagesService, Message) {

      var sendSeenStatusToServer = function (channel) {
        $log.info("Current Channel: ", channel);
        /*if (channel.containsUnred()) {
          messagesService.getLastMessageFromDb(channel.id, function (message) {
            $log.info("Last Message:", message);
          });
        }*/
      };

      $scope.messages = [];
      function loadMessagesFromDb() {
        messagesService.getMessagesFromDb($stateParams.channel.id,
          function (messages) {
            messages.forEach(function (msg) {
              var message = new Message(msg.body, msg.senderId, msg.channelId,
                msg.status, msg._id, msg.datetime);
              addMessageToArray(message);
            });
            $scope.$apply();
          });
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
          });
      };

      $scope.$watch(
        function () {
          return $stateParams.channel;
        },
        function (newChannelValue) {
          if (newChannelValue !== null) {
            loadMessagesFromDb();
            sendSeenStatusToServer(newChannelValue);
          }
        }
      );

      messagesService.setCtrlCallback(addMessageToArray);
    }
  ]);
