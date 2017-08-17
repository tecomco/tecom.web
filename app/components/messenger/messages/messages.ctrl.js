'use strict';

app.controller('messagesController', [
  '$scope', '$rootScope', '$state', '$stateParams', '$window', '$timeout',
  'Message', 'messagesService', 'channelsService', 'filesService',
  '$q', 'Team', 'ArrayUtil', 'textUtil', 'CurrentMember',
  'ngProgressFactory',
  function ($scope, $rootScope, $state, $stateParams, $window, $timeout,
    Message, messagesService, channelsService, filesService, $q, Team,
    ArrayUtil, textUtil, CurrentMember, ngProgressFactory
  ) {

    var self = this;
    $scope.messages = [];
    $scope.hasUnreadNewMessages = false;
    var isAnyLoadingMessageGetting;
    var prevScrollTop;
    var messagesHolder = document.getElementById('messagesHolder');
    var messagesWindow = document.getElementById('messagesWindow');
    var initialMemberLastSeenId;
    var initialLastMessageId;
    var isJumpDownScrollingDown = false;
    var hasUnreadInitializeMessages = false;

    $scope.$on('channels:updated', function (event, data) {
      if (data === 'init') {
        setCurrentChannel().then(function () {
          if ($scope.channel) {
            $scope.channel.initialMessagesPromise
              .then(function () {
                return initialize();
              })
              .then(function () {
                finishLoading();
              });
          } else {
            finishLoading();
          }
        });
      }
    });

    if (!$stateParams.slug) {
      channelsService.setCurrentChannelBySlug(null);
      return;
    } else if (channelsService.areChannelsReady()) {
      setCurrentChannel().then(function () {
        $scope.channel.initialMessagesPromise
          .then(initialize());
      });
    }

    $scope.$on('type:start', function (event, channelId) {
      if ($scope.channel.id === channelId)
        checkShouldScrollBottom();
    });


    $scope.$on('message', function (event, message) {
      if ($scope.channel.id == message.channelId) {
        if (!isBottomOfMessagesHolder()) {
          $scope.hasUnreadNewMessages = true;
          $timeout(function () {
            $scope.$apply();
          });
        }
        var messageJson = [];
        messageJson.push(message)
        messagesService.updateRepliedMessagesProperties(messageJson,
          $scope.messages);
        if ($rootScope.isTabFocused) {
          $scope.channel.seenLastMessage();
          messagesService.seenMessage($scope.channel.id, message.id,
            message.senderId);
        } else {
          self.lastUnSeenMessage = message;
        }
        $scope.messages.push(message);
        if (message.isFile())
          filesService.createFileManagerFile(message.additionalData.fileId,
            message.additionalData.url, message.additionalData.name,
            message.datetime, message.additionalData.type);
        checkShouldScrollBottom();
      }
    });

    $scope.$on('file:uploading', function (event, file) {
      $scope.uploadErrorNotif = false;
      $scope.uploadSizeLimitNotif = false;
      var message = messagesService.sendFileAndGetMessage($scope.channel
        .id, file, $scope.replyTo);
      $scope.replyTo = null
      $scope.messages.push(message);
      scrollBottom();
      generateUploadProgressBar(message);
    });

    $scope.$on('file:uploadError', function (event, err) {
      if (self.uploadErrNotifTimeout) {
        $timeout.cancel(self.uploadErrNotifTimeout);
      }
      if (err === 'uploadError')
        setUploadErrorNotif();
      else if (err === 'sizeLimit')
        setUploadSizeLimitNotif();
    });

    $scope.upload = function (file, errFiles) {
      $rootScope.$broadcast('file:upload', file, errFiles);
    };

    $scope.reuploadFile = function (fileTimestamp) {
      messagesService.reuploadFile(fileTimestamp);
    };

    $scope.removeUploadFailedMessageByFileTimestamp = function (
      fileTimestamp) {
      ArrayUtil.removeElementByKeyValue($scope.messages, 'fileTimestamp',
        fileTimestamp);
      messagesService.removeUploadFailedFileByFileTimestamp(fileTimestamp);
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
        messageBody, $scope.replyTo);
      $scope.replyTo = null;
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

    $scope.setReplyMessage = function (message) {
      $scope.replyTo = message.id;
      $scope.replyBody = message.body;
    };

    $scope.getReplyMessageSenderUsername = function (message) {
      var replyMessage = ArrayUtil.getElementByKeyValue($scope.messages,
        'id', message.replyTo);
      if (replyMessage)
        return replyMessage.getUsername();
      if (message.replySenderId)
        return Team.getUsernameByMemberId(message.replySenderId);
    };

    $scope.getReplyMessageBody = function (message) {
      var replyMessage = ArrayUtil.getElementByKeyValue($scope.messages,
        'id',
        message.replyTo);
      if (replyMessage)
        return replyMessage.body;
      if (message.replyBody)
        return message.replyBody;
    };

    $scope.scrollToReplyElement = function (replyTo) {
      var message;
      getReplyMessageIfNotExists(replyTo)
        .then(function () {
          message = ArrayUtil.getElementByKeyValue($scope.messages, 'id',
            replyTo);
          return getClosestLoadingMessageIfCloseEnoughByMessageId(
            message.id);
        })
        .then(function () {
          message.highlightIt();
          scrollToMessageElementById(replyTo);
          hasUnreadInitializeMessages = true;
        });
    };

    $scope.closeReply = function () {
      $scope.replyTo = null;
    };

    $scope.showFileLine = function (fileId, startLine, endLine) {
      filesService.showFileLine(fileId, startLine, endLine);
    };

    $scope.navigateToAndWaitFor = function () {
      $state.go('messenger.home');
    };

    $scope.shouldShowJumpDownButton = function () {
      return isJumpDownScrollingDown || $scope.hasUnreadNewMessages ||
        hasUnreadInitializeMessages;
    };

    $scope.jumpDown = function () {
      scrollToMessageElementById($scope.channel.lastMessageId);
    };

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

    $scope.goLive = function (fileId, fileName) {
      filesService.makeFileLive($scope.channel.id, fileId, fileName);
    };

    $scope.viewFile = function (fileId) {
      filesService.viewFile(fileId);
    };

    $scope.fullscreenImage = function (url, name) {
      $rootScope.$broadcast('image:fullscreen', url, name);
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
      if (!initialLastMessageId)
        return false;
      return message.id === initialMemberLastSeenId + 1;
    };

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

    function initialize() {
      var deferred = $q.defer();
      initialLastMessageId = $scope.channel.lastMessageId;
      if (!$scope.channel.areAllMessagesHaveBeenSeen())
        initialMemberLastSeenId = $scope.channel.memberLastSeenId;
      $rootScope.$broadcast('channel:ready', $scope.channel);
      bindMessages()
        .then(deferred.resolve());
      $scope.inputMessage = '';
      return deferred.promise;
    }

    function generateUploadProgressBar(message) {
      $timeout(function () {
        var parentId = message.getFileTimestampId();
        message.uploadProgressBar = ngProgressFactory.createInstance();
        message.uploadProgressBar.setColor('#24A772');
        message.uploadProgressBar.setParent(document.getElementById(
          parentId));
        message.uploadProgressBar.setAbsolute();
        message.uploadProgressBar.start();
        message.uploadProgressBar.set(2);
      }, 0, false);
    }

    function getLoadingMessages(channelId, from, to, isDirectionUp) {
      var deferred = $q.defer();
      isAnyLoadingMessageGetting = true;
      messagesService.getMessagesRangeFromServer(channelId,
          CurrentMember.member.teamId, from, to, true)
        .then(function (messages) {
          removeLoadingMessage(from);
          messagesService.updateRepliedMessagesProperties(messages, $scope
            .messages);
          messages.forEach(function (message) {
            $scope.messages.push(message);
          });
          isAnyLoadingMessageGetting = false;
          deferred.resolve();
          getMessagePackagesIfLoadingsInView(isDirectionUp);
        });
      return deferred.promise;
    }

    function getClosestLoadingMessageIfCloseEnoughByMessageId(id) {
      var deferred = $q.defer();
      var loadingMessages = filterLoadingMessages();
      var closestLoadingMessage = messagesService.findClosestLoadingMessage(
        loadingMessages, id);
      if (closestLoadingMessage) {
        getLoadingMessages(closestLoadingMessage.additionalData.channelId,
          closestLoadingMessage.additionalData.from, closestLoadingMessage
          .additionalData.to).then(function () {
          deferred.resolve();
        });
      } else
        deferred.resolve();
      return deferred.promise;
    }

    function getLoadingMessageThatContainsReplyMessage(id) {
      var loadingMessages = filterLoadingMessages();
      var loadingMessageContainsReplyMessage = messagesService.findLoadingMessageContainsReplyMessage(
        loadingMessages, id);
      return getLoadingMessages(loadingMessageContainsReplyMessage.additionalData
        .channelId, loadingMessageContainsReplyMessage.additionalData.from,
        loadingMessageContainsReplyMessage.additionalData.to);
    }

    function getReplyMessageIfNotExists(replyTo) {
      var deferred = $q.defer();
      var message = ArrayUtil.getElementByKeyValue($scope.messages, 'id',
        replyTo);
      if (message) {
        if (message.isLoading()) {
          getLoadingMessages(message.additionalData.channelId, message.additionalData
            .from, message.additionalData.to).then(function () {
            deferred.resolve()
          })
        } else
          deferred.resolve();
      } else {
        getLoadingMessageThatContainsReplyMessage(replyTo)
          .then(function () {
            deferred.resolve();
          });
      }
      return deferred.promise;
    }

    function setCurrentChannel() {
      var deferred = $q.defer();
      var slug = $stateParams.slug ? $stateParams.slug.replace('@', '') :
        null;
      channelsService.setCurrentChannelBySlug(slug)
        .then(function () {
          $scope.channel = channelsService.getCurrentChannel();
          deferred.resolve();
        });
      return deferred.promise;
    }

    function bindMessages() {
      var deferred = $q.defer();
      messagesService.getMessagesByChannelId($scope.channel.id, $scope.channel
          .lastMessageId)
        .then(function (messages) {
          $scope.messages = messages;
          scrollToUnseenMessage();
          if ($scope.channel.hasUnread()) {
            var lastMessage = ArrayUtil.getElementByKeyValue($scope.messages,
              'id', $scope.channel.lastMessageId);
            messagesService.seenMessage($scope.channel.id, lastMessage.id,
              lastMessage.senderId);
            $timeout(function () {
              if (!isBottomOfMessagesHolder())
                hasUnreadInitializeMessages = true;
              $scope.$apply();
            });
          }
          deferred.resolve();
        });
      return deferred.promise;
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

    function removeLoadingMessage(messageId) {
      ArrayUtil.removeElementByKeyValue($scope.messages, 'id', messageId);
    }

    function setUploadErrorNotif() {
      if (!$scope.uploadErrorNotif) {
        $scope.uploadErrorNotif = true;
      }
      self.uploadErrNotifTimeout = $timeout(function () {
        $scope.uploadErrorNotif = false;
      }, 3000);
    }

    function setUploadSizeLimitNotif() {
      if (!$scope.uploadSizeLimitNotif) {
        $scope.uploadSizeLimitNotif = true;
      }
      self.uploadErrNotifTimeout = $timeout(function () {
        $scope.uploadSizeLimitNotif = false;
      }, 3000);
    }

    function scrollBottom() {
      $timeout(function () {
        messagesHolder.scrollTop = messagesHolder.scrollHeight;
      }, 0, false);
    }

    function checkShouldScrollBottom() {
      if (messagesHolder.scrollHeight - messagesHolder.scrollTop < 1.5 *
        messagesWindow.scrollHeight)
        scrollBottom();
    }

    function scrollToUnseenMessage() {
      if ($scope.channel.areAllMessagesHaveBeenSeen())
        scrollToMessageElementById($scope.channel.memberLastSeenId);
      else
        scrollToMessageElementById($scope.channel.memberLastSeenId + 1);
    }

    function finishLoading() {
      $rootScope.isLoading = false;
      $rootScope.$broadcast('loading:finished');
    }

    function scrollToMessageElementById(elementId) {
      $timeout(function () {
        isAnyLoadingMessageGetting = true;
        var messageElement = getMessageElementById(elementId);
        if (messageElement)
          messagesHolder.scrollTop = messageElement.offsetTop -
          messagesWindow.offsetTop - messagesWindow.scrollHeight / 2;
        isAnyLoadingMessageGetting = false;
      }, 0, false);
    }

    function isElementInViewPort(element, isDirectionUp) {
      if (isDirectionUp) {
        return (element.offsetTop > messagesHolder.scrollTop &&
          element.offsetTop < messagesHolder.scrollTop + messagesWindow.scrollHeight
        );
      } else {
        return (element.offsetTop > messagesHolder.scrollTop +
          messagesWindow.scrollHeight && element.offsetTop <
          messagesHolder.scrollTop + 2 * messagesWindow.scrollHeight);
      }
    }

    function filterLoadingMessages() {
      var loadingMessages = $scope.messages.filter(function (message) {
        return message.isLoading();
      });
      return loadingMessages;
    }

    function getMessageElementById(id) {
      var element = document.getElementById('message_' + id);
      return element;
    }

    function getMessagePackagesIfLoadingsInView(isDirectionUp) {
      filterLoadingMessages().forEach(function (message) {
        var element = getMessageElementById(message.id);
        if (isElementInViewPort(element, isDirectionUp) && !
          isAnyLoadingMessageGetting) {
          getLoadingMessages(message.additionalData.channelId,
            message.additionalData.from, message.additionalData.to,
            isDirectionUp);
        }
      });
    }

    function updateUnreadFlagsToCheckIfSeenMessages() {
      $scope.hasUnreadNewMessages = $scope.hasUnreadNewMessages &&
        !isBottomOfMessagesHolder();
      hasUnreadInitializeMessages = hasUnreadInitializeMessages &&
        !isBottomOfMessagesHolder();
    }

    function isBottomOfMessagesHolder() {
      return messagesHolder.scrollTop + messagesWindow.scrollHeight >
        messagesHolder.scrollHeight;
    }

    document.getElementById('inputPlaceHolder').focus();

    angular.element(messagesHolder)
      .bind('scroll', function () {
        var isDirectionUp;
        var scrollTop = messagesHolder.scrollTop;
        if (prevScrollTop) {
          if (prevScrollTop > scrollTop)
            isDirectionUp = true;
          else
            isDirectionUp = false;
        }
        prevScrollTop = scrollTop;
        if (!isBottomOfMessagesHolder() && isDirectionUp === false)
          isJumpDownScrollingDown = true;
        else
          isJumpDownScrollingDown = false;
        getMessagePackagesIfLoadingsInView(isDirectionUp);
        updateUnreadFlagsToCheckIfSeenMessages();
        $scope.$apply();
      });

    document.onkeydown = function (evt) {
      evt = evt || $window.event;
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
