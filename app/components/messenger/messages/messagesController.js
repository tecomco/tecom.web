'use strict';

app.controller('messagesController',
  ['$scope', '$stateParams', 'User', '$timeout', 'messagesService', 'Message',
  function ($scope, $stateParams, User, $timeout, messagesService, Message) {

    $scope.messages = [];

    function loadMessagesFromDb() {
      messagesService.getMessagesFromDb($stateParams.channel.id,
        function (messages) {
          messages.forEach(function (message) {
            var message = new Message(message.body, message.senderId,
              message.channelId, message.status, message._id, message.datetime);
            addMessageToArray(message);
          });
          $scope.$apply();
        });
    };

    function addMessageToArray(message) {
      $scope.messages.push(message);
      $timeout(function () {
        var holder = document.getElementById('messagesHolder');
        holder.scrollTop = holder.scrollHeight;
      }, 0, false);
    };

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
        if (!newChannelValue) {
          loadMessagesFromDb();
        }
      }
    );

    messagesService.setCtrlCallback(addMessageToArray);
  }
]);
