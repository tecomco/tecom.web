'use strict';

app.run(['$rootScope', function ($rootScope) {
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
    $rootScope.toParams = toParams;
    console.log("Parameters:", toParams);
  });
}]);

app.controller('messagesController', ['$rootScope', '$scope', '$stateParams',
  '$log', 'User', '$timeout', 'arrayUtil', 'messagesService', 'Message', 'db',
  function ($rootScope, $scope, $stateParams, $log, User, $timeout, arrayUtil,
            messagesService, Message, db) {

    $scope.messages = [];

    $scope.loadMessagesFromDb = function () {
      db.loadChannelMessages($stateParams.channel.id, function (messages) {
        messages.reverse();
        angular.forEach(messages, function (message) {
          var tmpMessage = new Message(message.body, message.sender,
            message.channelId, message.status, message._id, message.id);
          pushMessage(tmpMessage);
        });
        $scope.$apply();
      });
    };

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
      $log.info("pushed message: ", message);
      $scope.messages.push(message);
      $timeout(function () {
        var holder = document.getElementById('messagesHolder');
        holder.scrollTop = holder.scrollHeight;
      }, 0, false);
    };
    messagesService.setPushCallbackFunction(pushMessage);

    $scope.$watch(
      function () {
        return $stateParams.channel;
      },
      function handleStateParamChange(newValue) {
        if (newValue !== null) {
          $scope.loadMessagesFromDb();
        }
      }
    );
  }
]);
