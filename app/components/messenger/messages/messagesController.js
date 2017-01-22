'use strict';

app.controller('messagesController',
  ['$scope', '$state', '$stateParams', '$timeout', 'messagesService',
    'channelsService',
  function ($scope, $state, $stateParams, $timeout, messagesService,
    channelsService) {

    var self = this;

    $scope.messages = [];

    $scope.channel = getCurrentChannel();
    if ($scope.channel) {
      bindMessages();
    }

    $scope.$on('channels:updated', function (event, data) {
      if (data === 'init') {
        $scope.channel = getCurrentChannel();
        bindMessages();
      }
    });

    $scope.$on('message', function (event, message) {
      if ($scope.channel.id == message.channelId) {
        $scope.messages.push(message);
        scrollBottom();
        messagesService.seenMessage($scope.channel.id, message.id,
          message.senderId);
      }
    });

    $scope.sendMessage = function ($event) {
      $event.preventDefault();
      var messageBody = $scope.inputMessage.trim();
      if (!messageBody) return;
      var message = messagesService.sendAndGetMessage($scope.channel.id,
        messageBody);
      $scope.messages.push(message);
      scrollBottom();
      clearMessageInput();
      messagesService.endTyping($scope.channel.id);
    };

    $scope.startTyping = function () {
      if (self.isTypingTimeout) {
        $timeout.cancel(self.isTypingTimeout);
      }
      if (!this.isTyping) {
        this.isTyping = true;
        messagesService.startTyping($scope.channel.id);
      }
      self.isTypingTimeout = $timeout(function () {
        this.isTyping = false;
        messagesService.endTyping($scope.channel.id);
      }, 2000);
    };

    function getCurrentChannel() {
      var slug = $stateParams.slug.replace('@', '');
      return channelsService.findChannelBySlug(slug);
    }

    function bindMessages() {
      messagesService.getMessagesByChannelId($scope.channel.id)
        .then(function (messages) {
          $scope.messages = messages;
          scrollBottom();
          messagesService.seenLastMessageByChannelId($scope.channel.id);
        });
    }

    function scrollBottom() {
      $timeout(function () {
        var holder = document.getElementById('messagesHolder');
        holder.scrollTop = holder.scrollHeight;
      }, 0, false);
    }

    function clearMessageInput() {
      $scope.inputMessage = '';
    }

    document.getElementById('inputPlaceHolder').focus();

    document.onkeydown = function (evt) {
      evt = evt || window.event;
      if (evt.keyCode == 27) {
        $state.go('messenger.home');
      }
    };

  }
]);
