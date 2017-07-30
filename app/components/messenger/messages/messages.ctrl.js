'use strict';

app.controller('messagesController', [
  '$scope', '$rootScope', '$state', '$stateParams', '$window', '$timeout',
  'Upload', 'Message', 'messagesService', 'channelsService', 'filesService',
  '$q', 'ArrayUtil', 'textUtil', 'CurrentMember', 'ngProgressFactory',
  function ($scope, $rootScope, $state, $stateParams, $window, $timeout,
    Upload, Message, messagesService, channelsService, filesService, $q,
    ArrayUtil, textUtil, CurrentMember, ngProgressFactory
  ) {

    var self = this;
    $scope.messages = [];
    var isAnyLoadingMessageGetting;
    var prevScrollTop;
    var messagesHolder = document.getElementById('messagesHolder');
    var messagesWindow = document.getElementById('messagesWindow');
    var initialMemberLastSeenId;

    if (!$stateParams.slug) {
      channelsService.setCurrentChannelBySlug(null);
      return;
    } else if (channelsService.areChannelsReady()) {
      initialize();
    }

    $scope.$on('scroll:isTyping', function () {
      checkShouldScrollBottom();
    });

    $scope.$on('channels:updated', function (event, data) {
      if (data === 'init') {
        initialize();
      }
    });

    $scope.$on('message', function (event, message) {
      if ($scope.channel.id == message.channelId) {
        if ($rootScope.isTabFocused) {
          $scope.channel.seenLastMessage();
          messagesService.seenMessage($scope.channel.id, message.id,
            message.senderId);
        } else {
          self.lastUnSeenMessage = message;
        }
        $scope.messages.push(message);
        checkShouldScrollBottom();
      }
    });

    $scope.$on('file:upload:progress', function (event, percent) {
      if (percent === 100)
        self.uploadProgressBar.complete();
      else
        self.uploadProgressBar.set(percent);
    });

    $scope.$on('file:uploading', function (event, file) {
      $scope.uploadErrNotif = false;
      var message = messagesService.sendFileAndGetMessage($scope.channel
        .id, file, file.name);
      $scope.messages.push(message);
      scrollBottom();
      generateUploadProgressBar(message.getFileTimestampId());
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
      $scope.channel.seenLastMessage();
      var message = messagesService.sendAndGetMessage($scope.channel.id,
        messageBody);
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
        messagesHolder.scrollTop = messagesHolder.scrollHeight;
      }, 0, false);
    }

    function checkShouldScrollBottom() {
      if (messagesHolder.scrollHeight - messagesHolder.scrollTop < 1.5 * messagesWindow.scrollHeight)
        scrollBottom();
    }

    function scrollToUnseenMessage() {
      if ($scope.channel.areAllMessagesHaveBeenSeen())
        scrollToMessageElementById($scope.channel.memberLastSeenId);
      else
        scrollToMessageElementById($scope.channel.memberLastSeenId + 1);
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
      channelsService.addMembersToChannel([CurrentMember.member.id],
        $scope.channel.id);
      $scope.channel.isCurrentMemberChannelMember = true;
    };

    $scope.isMessageFirstUnread = function (message) {
      return (initialMemberLastSeenId !== undefined && message.id ===
        initialMemberLastSeenId + 1);
    };

    function initialize() {
      setCurrentChannel().then(function () {
        if ($scope.channel) {
          if (!$scope.channel.areAllMessagesHaveBeenSeen())
            initialMemberLastSeenId = $scope.channel.memberLastSeenId;
          $rootScope.$broadcast('channel:ready', $scope.channel);
          bindMessages();
          $scope.inputMessage = '';
        }
      });
    }

    function generateUploadProgressBar(parentId) {
      $timeout(function () {
        self.uploadProgressBar = ngProgressFactory.createInstance();
        self.uploadProgressBar.setColor('#24A772');
        self.uploadProgressBar.setParent(document.getElementById(
          parentId));
        self.uploadProgressBar.setAbsolute();
        self.uploadProgressBar.start();
        self.uploadProgressBar.set(2);
      }, 0, false);
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

    function getLoadingMessages(channelId, from, to, direction) {
      messagesService.getMessagesRangeFromServer(channelId,
        CurrentMember.member.teamId, from, to).then(function (messages) {
        removeLoadingMessage(from);
        messages.forEach(function (message) {
          if (!ArrayUtil.containsKeyValue($scope.messages, 'id',
              message.id)) {
            $scope.messages.push(message);
          }
        });
        isAnyLoadingMessageGetting = false;
        getMessagePackagesIfLoadingsInView(direction);
      });
    }

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
          scrollToUnseenMessage();
          handleLoadingMessages();
          if ($scope.channel.hasUnread()) {
            var lastMessage = ArrayUtil.getElementByKeyValue($scope.messages,
              'id', $scope.channel.lastMessageId);
            messagesService.seenMessage($scope.channel.id, lastMessage.id,
              lastMessage.senderId);
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

    function handleLoadingMessages() {
      var packetStartPoint;
      var i;

      if ($scope.messages.length > 0) {
        var firstDbMessageId = $scope.messages[0].id;
        var lastDbMessageId = $scope.messages[$scope.messages.length - 1].id;

        for (i = 0; i < $scope.messages.length; i++) {
          if (i !== $scope.messages.length - 1) {
            if ($scope.messages[i + 1].id - $scope.messages[i].id > 1) {
              generateLoadingMessage($scope.channel.id, $scope.messages[i].id +
                1,
                $scope.messages[i + 1].id - 1);
            }
          }
        }

        packetStartPoint = firstDbMessageId - 1;
        for (i = firstDbMessageId - 1; i > 0; i--) {
          if (packetStartPoint - i >= Message.MAX_PACKET_LENGTH - 1 || (i ===
              1)) {
            generateLoadingMessage($scope.channel.id, i, packetStartPoint);
            packetStartPoint = i - 1;
          }
        }
        packetStartPoint = lastDbMessageId + 1;
        for (i = lastDbMessageId + 1; i <= $scope.channel.lastMessageId; i++) {
          if (i - packetStartPoint >= Message.MAX_PACKET_LENGTH - 1 ||
            (i === $scope.channel.lastMessageId - 1)) {
            generateLoadingMessage($scope.channel.id, packetStartPoint, i);
            packetStartPoint = i + 1;
          }
        }
      } else {
        packetStartPoint = $scope.channel.lastMessageId - 1;
        for (i = $scope.channel.lastMessageId - 1; i > 0; i--) {
          if (packetStartPoint - i >= Message.MAX_PACKET_LENGTH - 1 || (i ===
              1)) {
            generateLoadingMessage($scope.channel.id, i, packetStartPoint);
            packetStartPoint = i - 1;
          }
        }
      }
      getMessagePackagesIfLoadingsInView();
    }

    function generateLoadingMessage(channelId, fromId, toId) {
      var additionalData = {
        'channelId': channelId,
        'from': fromId,
        'to': toId
      };
      if (toId - fromId < Message.MAX_PACKET_LENGTH) {
        var loadingMessage = new Message(null, Message.TYPE.LOADING, null,
          channelId, null, null,
          additionalData, null, null);
        loadingMessage.setId(fromId);
        $scope.messages.push(loadingMessage);
      } else {
        generateLoadingMessage(channelId, fromId, fromId + Message.MAX_PACKET_LENGTH -
          1);
        generateLoadingMessage(channelId, fromId + Message.MAX_PACKET_LENGTH,
          toId);
      }
    }

    function removeLoadingMessage(messageId) {
      ArrayUtil.removeElementByKeyValue($scope.messages, 'id', messageId);
    }

    function scrollToMessageElementById(elementId) {
      $timeout(function () {
        var messageElement = getMessageElementById(elementId);
        if (messageElement)
          messagesHolder.scrollTop = messageElement.offsetTop - messagesWindow.offsetTop;
      }, 0, false);
    }

    function isElementInViewPort(element, direction) {
      if (element) {
        if (direction === 'up') {
          if (element.offsetTop > messagesHolder.scrollTop &&
            element.offsetTop < messagesHolder.scrollTop + messagesHolder.scrollHeight
          )
            return true;
        } else {
          if (element.offsetTop > messagesHolder.scrollTop + messagesWindow.scrollHeight &&
            element.offsetTop < messagesHolder.scrollTop + 2 * messagesWindow
            .scrollHeight)
            return true;
        }
      }
      return false;
    }

    function filterAndGetLoadingMessages() {
      var loadingMessages = $scope.messages.filter(function (message) {
        return message.type === Message.TYPE.LOADING;
      });
      return loadingMessages;
    }

    function getMessageElementById(id) {
      var element = document.getElementById('message_' + id);
      return element;
    }

    function getMessagePackagesIfLoadingsInView(direction) {
      filterAndGetLoadingMessages().forEach(function (message) {
        var element = getMessageElementById(message.id);
        if (isElementInViewPort(element, direction) && !
          isAnyLoadingMessageGetting) {
          getLoadingMessages(message.additionalData.channelId,
            message.additionalData.from, message.additionalData.to,
            direction);
          isAnyLoadingMessageGetting = true;
        }
      });
    }

    document.getElementById('inputPlaceHolder').focus();

    angular.element(messagesHolder)
      .bind('scroll', function () {
        var scrollDirection;
        var scrollTop = messagesHolder.scrollTop;
        if (prevScrollTop) {
          if (prevScrollTop > scrollTop)
            scrollDirection = 'up';
          else
            scrollDirection = 'down';
        }
        prevScrollTop = scrollTop;
        getMessagePackagesIfLoadingsInView(scrollDirection);
      });

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
