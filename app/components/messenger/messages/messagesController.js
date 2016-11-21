'use strict';

app.controller('messagesController', ['$scope', '$stateParams', '$log',
  '$localStorage', 'socket', 'messagesService', '$timeout', 'arrayUtil',
  function ($scope, $stateParams, $log, $localStorage, socket, messagesService,
            $timeout, arrayUtil) {

    var messageStatus = {
      PENDING: 0,
      SENT: 1,
      DELIVERED: 2,
      SEEN: 3
    };

    $scope.messages = [];

    // socket.on('message', function (message) {
    //   message.datetime = new Date(message.datetime);
    //   pushMessage(message);
    // });

    var Message = function (sender, channelId, body) {
      return {
        sender: sender,
        channelId: channelId,
        body: body,
        datetime: new Date(),
        id: 0,
        status: messageStatus.PENDING
      };
    };

    $scope.sendMessage = function () {
      var messageBody = $scope.inputMessage.trim();
      if (!messageBody) return;
      var message = Message($localStorage.decodedToken.memberships[0].username,
        $stateParams.channel.id, messageBody, 0, $scope.id++);
      pushMessage(message);
      $scope.inputMessage = '';
      var tmpMessage = {
        channelId: message.channelId,
        messageBody: message.body
      };
      var index = $scope.messages.length - 1;
      messagesService.sendMessage(tmpMessage, function () {
        $scope.messages[index].status = messageStatus.SENT;
      });
    };

    var pushMessage = function (message) {
      $scope.messages.push(message);
      $timeout(function(){
        var holder = document.getElementById('messagesHolder');
        holder.scrollTop = holder.scrollHeight;
      }, 0, false);
    };

    $scope.getMessageStatusIcon = function (message) {
      if (message.status === messageStatus.PENDING)
        return 'zmdi zmdi-time';
      else if (message.status === messageStatus.SENT)
        return 'zmdi zmdi-check';
      else if (message.status === messageStatus.DELIVERED)
        return 'zmdi zmdi-ckeck-all';
      else if (message.status === messageStatus.SEEN)
        return 'zmdi zmdi-eye';
    };

    $scope.getMessageCSS = function (message) {
      if (message.sender === $localStorage.decodedToken.memberships[0].username)
        return 'msg msg-send';
      else
        return 'msg msg-recieve';
    };

    return {
      pushMessage: pushMessage
    };
  }
]);
