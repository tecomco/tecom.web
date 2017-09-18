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
    $scope.replyMessage = null;
    $scope.isFullscreenVisible = false;
    $scope.isMessageLoadingDone = false;
    var isAnyLoadingMessageGetting;
    var prevScrollTop;
    var isDirectionUp;
    var messagesHolder = document.getElementById('messagesHolder');
    var messagesWindow = document.getElementById('messagesWindow');
    var inputPlaceHolder = document.getElementById('inputPlaceHolder');
    var initialMemberLastSeenId;
    var initialLastMessageId;
    var isBottomOfMessagesHolder = true;
    var prevIsBottomOfMessagesHolder = false;

    $scope.$on('channels:updated', function (event, data) {
      if (data === 'init') {
        setCurrentChannel()
          .then(function () {
            if ($scope.channel) {
              $scope.channel.initialPromise
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
      setCurrentChannel()
        .then(function () {
          return $scope.channel.initialPromise;
        })
        .then(function () {
          initialize();
        });
    }

    $scope.$on('type:start', function (event, channelId) {
      if ($scope.channel.id === channelId)
        checkShouldScrollBottom();
    });

    $scope.$on('message', function (event, message) {
      if ($scope.channel.id == message.channelId) {
        if (!checkIsBottomOfMessagesHolder()) {
          $scope.hasUnreadNewMessages = true;
          $timeout(function () {
            $scope.$apply();
          });
        }
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
      $scope.uploadStorageErrorNotif = false;
      var message = messagesService.sendFileAndGetMessage(
        $scope.channel.id, file, $scope.replyMessage);
      if (message.isImage())
        message.imageFile = file;
      $scope.replyMessage = null;
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
      else if (err === 'storageError')
        setUploadStorageErrorNotif();
    });

    $scope.$on('image:fullscreen', function (event, url, name) {
      setFullscreenImageProperty(url, name);
    });

    $rootScope.$on('remove:scopeMessage', function (event, timestamp) {
      ArrayUtil.removeElementByKeyValue($scope.messages,
        'timestamp', timestamp);
    });

    $scope.closeFullscreenImage = function () {
      $scope.isFullscreenVisible = false;
    };

    $scope.upload = function (file, errFiles) {
      $rootScope.$broadcast('file:upload', file, errFiles);
    };

    $scope.abortUpload = function (message) {
      message.isUploadAborted = true;
      message.uploadPromise.abort();
      message.uploadPromise = null;
    };

    $scope.reuploadFile = function (timestamp) {
      messagesService.reuploadFile(timestamp);
    };

    $scope.removeUploadFailedMessageByFileTimestamp = function (
      timestamp) {
      ArrayUtil.removeElementByKeyValue($scope.messages,
        'timestamp', timestamp);
      messagesService.removeUploadFailedFileByFileTimestamp(
        timestamp);
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
        messageBody, $scope.replyMessage);
      $scope.replyMessage = null;
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
      messagesService.updateChannelDraftMessage($scope.channel.id, $scope.inputMessage);
    };

    $scope.isMessageMemberFirstMessage = function (message) {
      if (message.senderId === null) return false;
      if (!message.id) {
        var oneBeforeTheLastMessage = getMessageById($scope.channel.lastMessageId);
        if (oneBeforeTheLastMessage)
          return message.senderId !== oneBeforeTheLastMessage.senderId;
      }
      var previousMessage = getMessageById(message.id - 1);
      if (previousMessage)
        return message.senderId !== previousMessage.senderId;
      return true;
    };

    $scope.isMessageMemberLastMessage = function (message) {
      if (!message.id)
        return false;
      var nextMessage = getMessageById(message.id + 1);
      if (nextMessage)
        return message.senderId !== nextMessage.senderId;
      return true;
    };

    $scope.setReplyMessage = function (message) {
      $scope.replyMessage = message;
      shouldScrollToSeeRepliedMessage(message.id);
      inputPlaceHolder.focus();
    };

    $scope.closeReply = function () {
      $scope.replyMessage = null;
    };

    $scope.scrollToSelectedMessage = function (replyTo) {
      getMessageIfNotExists(replyTo)
        .then(function () {
          return getClosestLoadingMessageIfCloseEnoughByMessageId(
            replyTo);
        })
        .then(function () {
          var message = getMessageById(replyTo);
          scrollToMessageElementById(replyTo);
          message.highlight();
        });
    };

    $scope.showFileLine = function (fileId, startLine, endLine) {
      filesService.showFileLine(fileId, startLine, endLine);
    };

    $scope.navigateToAndWaitFor = function () {
      $state.go('messenger.home');
    };

    $scope.shouldShowJumpDownButton = function () {
      return !isBottomOfMessagesHolder || $scope.hasUnreadNewMessages;
    };

    $scope.jumpDown = function () {
      scrollBottom();
      $timeout(function () {
        $scope.$apply();
      }, 100, false);
    };

    $scope.goLive = function (fileId, fileName) {
      filesService.makeFileLive($scope.channel.id, fileId, fileName);
    };

    $scope.viewFile = function (fileId) {
      filesService.viewFile(fileId);
    };

    $scope.fullscreenImage = function (url, name) {
      setFullscreenImageProperty(url, name);
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
      var previousMessageId;
      if (message.id)
        previousMessageId = message.id - 1;
      else
        previousMessageId = $scope.channel.lastMessageId;
      if (previousMessageId === 0)
        return true;
      else {
        var previousMessage = getMessageById(previousMessageId);
        if (previousMessage) {
          var isYearDifferent = message.datetime.getFullYear() !==
            previousMessage.datetime.getFullYear();
          var isMonthDifferent = message.datetime.getMonth() !==
            previousMessage.datetime.getMonth();
          var isDayDifferent = message.datetime.getDate() !==
            previousMessage.datetime.getDate();
          return isYearDifferent || isMonthDifferent || isDayDifferent;
        }
      }
    };

    function initialize() {
      $scope.uploadLimit = Team.plan.uploadLimit;
      // TODO: tofmali
      $scope.channel.lastMessageId = $scope.channel.lastMessageId || 0;
      $scope.channel.memberLastSeenId = $scope.channel.memberLastSeenId || 0;
      initialLastMessageId = $scope.channel.lastMessageId;
      if (!$scope.channel.areAllMessagesHaveBeenSeen())
        initialMemberLastSeenId = $scope.channel.memberLastSeenId;
      $rootScope.$broadcast('channel:ready', $scope.channel);
      setInputMessage();
      return bindMessages();
    }

    function setInputMessage() {
      var draftMessage = messagesService.getChannelDraftMessage(
        $scope.channel.id);
      if (draftMessage)
        $scope.inputMessage = draftMessage;
      else
        $scope.inputMessage = '';
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
      messagesService.getLoadingMessagesByChannelId(channelId,
          CurrentMember.member.teamId, from, to)
        .then(function (messages) {
          removeLoadingMessage(from);
          messages.forEach(function (message) {
            $scope.messages.push(message);
          });
          isAnyLoadingMessageGetting = false;
          deferred.resolve();
          $timeout(function () {
            getMessagePackagesIfLoadingsInView(isDirectionUp);
          });
        });
      return deferred.promise;
    }

    function getClosestLoadingMessageIfCloseEnoughByMessageId(messageId) {
      var deferred = $q.defer();
      var loadingMessages = filterLoadingMessages();
      var closestLoadingMessage = messagesService.findClosestLoadingMessage(
        loadingMessages, messageId);
      if (closestLoadingMessage) {
        getLoadingMessages(closestLoadingMessage.additionalData.channelId,
            closestLoadingMessage.additionalData.from,
            closestLoadingMessage.additionalData.to)
          .then(function () {
            deferred.resolve();
          });
      } else
        deferred.resolve();
      return deferred.promise;
    }

    function getLoadingMessageContainingReplyMessage(messageId) {
      var loadingMessages = filterLoadingMessages();
      var loadingMessageContainingReplyMessage = messagesService.findLoadingMessageContainsReplyMessage(
        loadingMessages, messageId);
      return getLoadingMessages(
        loadingMessageContainingReplyMessage.additionalData.channelId,
        loadingMessageContainingReplyMessage.additionalData.from,
        loadingMessageContainingReplyMessage.additionalData.to);
    }

    function getMessageIfNotExists(replyTo) {
      var deferred = $q.defer();
      var message = getMessageById(replyTo);
      if (message) {
        if (message.isLoading()) {
          getLoadingMessages(message.additionalData.channelId,
              message.additionalData.from, message.additionalData.to)
            .then(function () {
              deferred.resolve();
            });
        } else
          deferred.resolve();
      } else {
        getLoadingMessageContainingReplyMessage(replyTo)
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
      messagesService.getMessagesByChannelId($scope.channel.id,
          $scope.channel.teamId, $scope.channel.memberLastSeenId,
          $scope.channel.lastMessageId)
        .then(function (messages) {
          $scope.messages = messages;
          $scope.isMessageLoadingDone = true;
          scrollToUnseenMessage();
          if ($scope.channel.hasUnread()) {
            var lastMessage = getMessageById($scope.channel.lastMessageId);
            messagesService.seenMessage($scope.channel.id, lastMessage.id,
              lastMessage.senderId);
            $timeout(function () {
              if (checkIsBottomOfMessagesHolder())
                isBottomOfMessagesHolder = true;
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
      messagesService.removeChannelDraftMessage($scope.channel.id);
    }

    function getMessageById(messageId) {
      return ArrayUtil.getElementByKeyValue($scope.messages, 'id', messageId);
    }

    function removeLoadingMessage(messageId) {
      ArrayUtil.removeElementByKeyValue($scope.messages, 'id', messageId);
    }

    function setFullscreenImageProperty(url, name) {
      $scope.fullscreenImageSrc = url;
      $scope.fullscreenImageName = name;
      $scope.isFullscreenVisible = true;
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

    function setUploadStorageErrorNotif() {
      if (!$scope.uploadStorageErrorNotif) {
        $scope.uploadStorageErrorNotif = true;
      }
      self.uploadErrNotifTimeout = $timeout(function () {
        $scope.uploadStorageErrorNotif = false;
      }, 3000);
    }

    function scrollBottom() {
      $timeout(function () {
        messagesHolder.scrollTop = messagesHolder.scrollHeight;
      });
    }

    function checkShouldScrollBottom() {
      if (messagesHolder.scrollHeight - messagesHolder.scrollTop < 1.5 *
        messagesWindow.scrollHeight)
        scrollBottom();
    }

    function shouldScrollToSeeRepliedMessage(id) {
      var element = getMessageElementById(id);
      var heightDifference = element.offsetTop + element.scrollHeight -
        messagesHolder.scrollTop - messagesWindow.scrollHeight + 40;
      if (heightDifference > 0 && heightDifference < 60)
        scrollToSeeRepliedMessage(heightDifference);
    }

    function scrollToSeeRepliedMessage(heightDifference) {
      $timeout(function () {
        messagesHolder.scrollTop = messagesHolder.scrollTop +
          heightDifference;
      });
    }

    function scrollToUnseenMessage() {
      if ($scope.channel.areAllMessagesHaveBeenSeen())
        scrollBottom();
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
          messagesWindow.offsetTop - messagesWindow.scrollHeight / 3;
        isAnyLoadingMessageGetting = false;
      }, 0, false);
    }

    function isElementInViewPort(element, isDirectionUp) {
      if (isDirectionUp) {
        return (element.offsetTop + element.scrollHeight + 250 >
          messagesHolder.scrollTop + messagesWindow.offsetTop &&
          element.offsetTop + element.scrollHeight < messagesHolder.scrollTop +
          messagesWindow.offsetTop + messagesWindow.scrollHeight
        );
      } else {
        return (element.offsetTop - 250 < messagesHolder.scrollTop +
          messagesWindow.scrollHeight && element.offsetTop >
          messagesHolder.scrollTop);
      }
    }

    function filterLoadingMessages() {
      var loadingMessages = $scope.messages.filter(function (message) {
        return message.isLoading();
      });
      return loadingMessages;
    }

    function getMessageElementById(messageId) {
      return document.getElementById('message_' + messageId);
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
        !checkIsBottomOfMessagesHolder();
    }

    function checkIsBottomOfMessagesHolder() {
      return messagesHolder.scrollTop + messagesWindow.scrollHeight >
        messagesHolder.scrollHeight;
    }

    inputPlaceHolder.focus();

    angular.element(messagesHolder)
      .bind('scroll', function () {
        var scrollTop = messagesHolder.scrollTop;
        if (prevScrollTop) {
          if (prevScrollTop > scrollTop)
            isDirectionUp = true;
          else
            isDirectionUp = false;
        }
        prevScrollTop = scrollTop;
        isBottomOfMessagesHolder = checkIsBottomOfMessagesHolder();
        getMessagePackagesIfLoadingsInView(isDirectionUp);
        updateUnreadFlagsToCheckIfSeenMessages();
        if (prevIsBottomOfMessagesHolder !== isBottomOfMessagesHolder)
          $scope.$apply();
        prevIsBottomOfMessagesHolder = checkIsBottomOfMessagesHolder();
      });

    document.onkeydown = function (evt) {
      evt = evt || $window.event;
      if (evt.keyCode == 27) {
        if ($scope.isFullscreenVisible) {
          $timeout(function () {
            $scope.closeFullscreenImage();
          });
        } else
          $state.go('messenger.home');
      }
    };

    $scope.$on('tab:focus:changed', function () {
      if ($rootScope.isTabFocused) {
        seenLastUnSeenMessage();
        $scope.$apply();
        inputPlaceHolder.focus();
      }
    });

  }
]);
