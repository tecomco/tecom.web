'use strict';

app.controller('messagesController', ['$scope', '$stateParams', '$log',
  'socket', 'messagesService', 'moment',
  function ($scope, $stateParams, $log, socket, messagesService, moment) {

    $scope.messages = [];
    socket.on('message', function (data) {
      data.datetime = new Date(data.datetime);
      $scope.messages.push(data);
    });

    $scope.sendMessage = function () {
      var messageBody = $scope.inputMessage.trim();
      if (!messageBody) return;
      var tmpMessage = {
        channelId: $stateParams.channel.id,
        messageBody: messageBody
      };
      messagesService.sendMessage(tmpMessage, function () {
      });
      $scope.inputMessage = '';
    };
  }
]);
