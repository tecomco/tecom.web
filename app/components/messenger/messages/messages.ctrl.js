'use strict';

app.controller('messagesController', [
  '$scope', '$rootScope', '$state', '$stateParams', '$window', '$timeout',
  'Upload', 'messagesService', 'channelsService', 'filesService', '$q',
  'ArrayUtil', 'textUtil','CurrentMember',
  function ($scope, $rootScope, $state, $stateParams, $window, $timeout,
    Upload, messagesService, channelsService, filesService, $q,
    ArrayUtil, textUtil, CurrentMember
  ) {

    var self = this;

    $scope.messages = [];
    $scope.file = {};

    if (!$stateParams.slug) {
      channelsService.setCurrentChannelBySlug(null);
      return;
    } else if (channelsService.areChannelsReady()) {
      initialize();
    }

    $scope.$on('scroll:isTyping', function () {
      scrollBottom();
    });

    $scope.$on('channels:updated', function (event, data) {
      if (data === 'init') {
        initialize();
      }
    });

    $scope.$on('message', function (event, message) {
      if ($scope.channel.id == message.channelId) {
        $scope.messages.push(message);
        scrollBottom();
        if ($rootScope.isTabFocused) {
          messagesService.seenMessage($scope.channel.id, message.id,
            message.senderId);
        } else {
          self.lastUnSeenMessage = message;
        }
      }
    });

    $scope.$on('file:uploading', function (event, file) {
      $scope.uploadErrNotif = false;
      var message = messagesService.sendFileAndGetMessage($scope.channel.id,
        file, file.name);
      $scope.messages.push(message);
      scrollBottom();
    });

    $scope.$on('file:uploadError', function () {
      if (self.uploadErrNotifTimeout) {
        $timeout.cancel(self.uploadErrNotifTimeout);
      }
      if (!$scope.uploadErrNotif) {
        $scope.uploadErrNotif = true;
      }
      self.uploadErrNotifTimeout = $timeout(function () {
        $scope.uploadErrNotif = false;
      }, 3000);
    });

    $scope.upload = function (file, errFiles) {
      $rootScope.$broadcast('file:upload', file, errFiles);
    };

    $scope.getInputStyle = function () {
      if (textUtil.isEnglish($scope.inputMessage)) {
        return {
          'text-align': 'left',
          'direction': 'ltr'
        };
      } else {
        return {};
      }
    };

    $scope.sendMessage = function ($event) {
      $event.preventDefault();
      var messageBody = $scope.inputMessage.trim();
      if (!messageBody) return;
      var message = messagesService.sendAndGetMessage($scope.channel.id,
        messageBody);
      $rootScope.$emit('yes:yes');
      $scope.messages.push(message);
      scrollBottom();
      clearMessageInput();
      messagesService.endTyping($scope.channel.id);
      $timeout.cancel(self.isTypingTimeout);
      self.isTyping = false;
    };

    $scope.typing = function () {
      if (self.isTypingTimeout) {
        $timeout.cancel(self.isTypingTimeout);
      }
      if (!self.isTyping) {
        self.isTyping = true;
        messagesService.startTyping($scope.channel.id);
      }
      self.isTypingTimeout = $timeout(function () {
        self.isTyping = false;
        messagesService.endTyping($scope.channel.id);
      }, 2000);
    };

    $scope.showFileLine = function (fileId, startLine, endLine) {
      filesService.showFileLine(fileId, startLine, endLine);
    };

    function scrollBottom() {
      $timeout(function () {
        var holder = document.getElementById('messagesHolder');
        holder.scrollTop = holder.scrollHeight;
      }, 0, false);
    }

    $scope.goLive = function (fileId, fileName) {
      filesService.makeFileLive($scope.channel.id, fileId, fileName);
    };

    $scope.viewFile = function (fileId) {
      filesService.viewFile(fileId);
    };

    $scope.archiveDirect = function (channel) {
      channelsService.archiveChannel(channel.id)
        .then(function () {
          $scope.removeAndCloseChannel(channel);
        })
        .catch(function () {
          /*
           Handle Archive Channel Error;
           */
        });
    };

    $scope.removeAndCloseChannel = function (channel) {
      channelsService.removeChannel(channel.id);
      $state.go('messenger.home');
    };

    $scope.joinPublicChannel = function () {
      channelsService.addMembersToChannel([CurrentMember.member.id],$scope.channel.id);
      $scope.channel.isCurrentMemberChannelMember = true ;
    };

    function initialize() {
      setCurrentChannel().then(function () {
        if ($scope.channel) {
          $rootScope.$broadcast('channel:ready', $scope.channel);
          bindMessages();
          $scope.inputMessage = '';
        }
      });
    }

    $scope.isMessageDateInAnotherDay = function (message) {
      if (message.id === 1)
        return true;
      else {
        var previousMessage =
          ArrayUtil.getElementByKeyValue($scope.messages, 'id', message.id -
            1);
        if (previousMessage) {
          var timeDiff =
            Math.abs(message.datetime.getTime() - previousMessage.datetime
              .getTime());
          var diffDays = Math.floor(timeDiff / (1000 * 3600 * 24));
          return (diffDays === 0) ? false : true;
        }
      }
    };

    function setCurrentChannel() {
      var defer = $q.defer();
      var slug = $stateParams.slug.replace('@', '');
      channelsService.setCurrentChannelBySlug(slug).then(function () {
        $scope.channel = channelsService.getCurrentChannel();
        defer.resolve();
      });
      return defer.promise;
    }

    function bindMessages() {
      messagesService.getMessagesByChannelId($scope.channel.id)
        .then(function (messages) {
          $scope.messages = messages;
          scrollBottom();
          if ($scope.channel.hasUnread()) {
            messagesService.seenLastMessageByChannelId($scope.channel.id);
          }
        });
    }

    function seenLastUnSeenMessage() {
      if (self.lastUnSeenMessage) {
        messagesService.seenMessage($scope.channel.id,
          self.lastUnSeenMessage.id, self.lastUnSeenMessage.senderId);
        self.lastUnSeenMessage = null;
      }
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

    $scope.$on('tab:focus:changed', function () {
      if ($rootScope.isTabFocused)
        seenLastUnSeenMessage();
    });

  }
]);
