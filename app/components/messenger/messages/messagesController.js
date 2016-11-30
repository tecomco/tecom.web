'use strict';

app.controller('messagesController', ['$scope', '$stateParams', '$log',
  'User', '$timeout', 'arrayUtil', 'messagesService', 'Message', 'db',
  function ($scope, $stateParams, $log, User, $timeout, arrayUtil,
            messagesService, Message, db) {

    $scope.messages = [];

    $scope.loadMessagesFromDb = function (channelId) {
      db.loadChannelMessages(channelId, function (messages) {
        messages.reverse();
        angular.forEach(messages, function (message) {
          var tmpMessage = new Message(message.body, message.sender,
            message.channelId, message.status, message._id, message.id);
          pushMessage(tmpMessage);
        });
        $log.info($scope.messages);
        $scope.$apply();
      });
    };


    $scope.loadMessagesFromDb($stateParams.channel.id);

    $scope.sendMessage = function () {
      var messageBody = $scope.inputMessage.trim();
      if (!messageBody) return;
      var username = User.username;
      var message = new Message(messageBody, username, $stateParams.channel.id);
      pushMessage(message);
      $scope.inputMessage = '';
      messagesService.sendMessage(message.getServerWellFormed(), function (data) {
        message.status = Message.STATUS_TYPE.SENT;
        message.updateIdAndDatetime(data);
        message.save();
      });
    };

    var pushMessage = function (message) {
      $scope.messages.push(message);
      $timeout(function () {
        var holder = document.getElementById('messagesHolder');
        holder.scrollTop = holder.scrollHeight;
      }, 0, false);
    };
    messagesService.setCallbackFunciton(pushMessage);
  }
]);
