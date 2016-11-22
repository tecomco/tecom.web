'use strict';

app.controller('messagesController', ['$scope', '$stateParams', '$log',
  '$localStorage', '$timeout', 'arrayUtil', 'messagesService', 'Message',
  function ($scope, $stateParams, $log, $localStorage, $timeout, arrayUtil,
    messagesService, Message) {

    $scope.messages = [];

    $scope.sendMessage = function () {
      var messageBody = $scope.inputMessage.trim();
      if (!messageBody) return;
      var username = $localStorage.decodedToken.memberships[0].username;
      var message = new Message(0, messageBody, username, $stateParams.channel.id);
      pushMessage(message);
      $scope.inputMessage = '';
      messagesService.sendMessage(message.getServerWellFormed(), function () {
        message.status = Message.STATUS_TYPE.SENT;
      });
    };

    var pushMessage = function (message) {
      $scope.messages.push(message);
      $timeout(function(){
        var holder = document.getElementById('messagesHolder');
        holder.scrollTop = holder.scrollHeight;
      }, 0, false);
    };

  }
]);
