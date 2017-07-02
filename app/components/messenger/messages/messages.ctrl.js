'use strict';

app.controller('messagesController', [
  '$scope', '$rootScope', '$state', '$stateParams', '$window', '$timeout',
  'Upload', 'Message', 'messagesService', 'channelsService', 'filesService',
  '$q', 'ArrayUtil', 'textUtil', 'CurrentMember',
  function ($scope, $rootScope, $state, $stateParams, $window, $timeout,
    Upload, Message, messagesService, channelsService, filesService,
    $q, ArrayUtil, textUtil, CurrentMember) {

    var self = this;
    $scope.messages = [];
    $scope.file = {};
    var scrollLimits;
    var flagLock = false;
    var prevScrollTop;

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

    function scrollToUnseenMessage() {
      var channel = channelsService.getCurrentChannel();
      scrollToMessageElementById(channel.memberLastSeenId);
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

    function getLoadingMessages(channelId, from, to, dir) {
      messagesService.getMessagePacketFromServer(channelId,
        CurrentMember.member.teamId, from, to).then(function (messages) {
        removeLoadingMessage(from);
        messages.forEach(function (message) {
          if (!ArrayUtil.containsKeyValue($scope.messages, 'id', message.id)) {
            $scope.messages.push(message);
          }
        });
        flagLock = false;
        // updateScrollLimits();
        console.log(dir);
        if (dir === 'up')
          scrollToMessageElementById(to + 1);
        else
          scrollToMessageElementById(from - 1);
        getMessagePackagesIfLoadingsInView(dir);
      });
    }

    $scope.isMessageFirstUnread = function (message) {
      var channel = channelsService.getCurrentChannel();
      if (message.id === channel.memberLastSeenId + 1 &&
        message.id !== channel.lastMessageId + 1)
        return true;
      else
        return false;
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
          scrollToUnseenMessage();
          handleLoadingMessages();
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

    function handleLoadingMessages() {
      var packetStartPoint;
      var channel = channelsService.getCurrentChannel();
      var i;

      if ($scope.messages.length > 0) {
        var firstDbMessageId = $scope.messages[0].id;
        var lastDbMessageId = $scope.messages[$scope.messages.length - 1].id;

        for (i = 0; i < $scope.messages.length; i++) {
          if (i !== $scope.messages.length - 1) {
            if ($scope.messages[i + 1].id - $scope.messages[i].id > 1) {
              generateLoadingMessage(channel.id, $scope.messages[i].id + 1,
                $scope.messages[i + 1].id - 1);
              // console.log('Middle GAP:', $scope.messages[i].id + 1, $scope.messages[i + 1].id - 1);
            }
          }
        }

        packetStartPoint = firstDbMessageId - 1;
        for (i = firstDbMessageId - 1; i > 0; i--) {
          if (packetStartPoint - i >= Message.MAX_PACKET_LENGTH - 1 || (i === 1)) {
            generateLoadingMessage(channel.id, i, packetStartPoint);
            // console.log('Start GAP:', i, packetStartPoint);
            packetStartPoint = i - 1;
          }
        }
        packetStartPoint = lastDbMessageId + 1;
        for (i = lastDbMessageId + 1; i <= channel.lastMessageId; i++) {
          if (i - packetStartPoint >= Message.MAX_PACKET_LENGTH - 1 ||
            (i === channel.lastMessageId - 1)) {
            generateLoadingMessage(channel.id, packetStartPoint, i);
            // console.log('End GAP:', packetStartPoint, i);
            packetStartPoint = i + 1;
          }
        }
      } else {
        packetStartPoint = channel.lastMessageId - 1;
        for (i = channel.lastMessageId - 1; i > 0; i--) {
          if (packetStartPoint - i >= Message.MAX_PACKET_LENGTH - 1 || (i === 1)) {
            generateLoadingMessage(channel.id, i, packetStartPoint);
            // console.log('Start GAP:', i, packetStartPoint);
            packetStartPoint = i - 1;
          }
        }
      }
      //updateScrollLimits();
      getMessagePackagesIfLoadingsInView();
    }

    function generateLoadingMessage(channelId, fromId, toId) {
      var additionalData = {
        'channelId': channelId,
        'from': fromId,
        'to': toId
      };
      if (toId - fromId < 16) {
        var loadingMessage = new Message(null, Message.TYPE.LOADING, null, channelId, null, null,
          additionalData, null, null);
        loadingMessage.setId(fromId);
        $scope.messages.push(loadingMessage);
      } else {
        generateLoadingMessage(channelId, fromId, fromId + Message.MAX_PACKET_LENGTH - 1);
        generateLoadingMessage(channelId, fromId + Message.MAX_PACKET_LENGTH, toId);
      }
    }

    function removeLoadingMessage(messageId) {
      ArrayUtil.removeElementByKeyValue($scope.messages, 'id', messageId);
    }

    function scrollToMessageElementById(elementId) {
      $timeout(function () {
        var holder = document.getElementById('messagesHolder');
        var messageElement = getMessageElementById(elementId);
        if (messageElement)
          holder.scrollTop = messageElement.offsetTop - 60;
      }, 0, false);
      console.log('scrolled');
    }

    function elementInViewport(el) {
      var messageHolder = document.getElementById('messagesHolder');
      var messagesWindow = document.getElementById('messagesWindow');
      if (el) {
        if (el.offsetTop > messageHolder.scrollTop &&
          el.offsetTop < messageHolder.scrollTop + messagesWindow.scrollHeight)
          return true;
        else
          return false;
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
      $scope.messages.forEach(function (message) {
        if (message.type === Message.TYPE.LOADING) {
          var element = getMessageElementById(message.id);
          if (elementInViewport(element) && !flagLock) {
            getLoadingMessages(message.additionalData.channelId,
              message.additionalData.from, message.additionalData.to, direction);
            flagLock = true;
          }
        }
      });
    }

    // function updateScrollLimits() {
    //   var holder = document.getElementById('messagesHolder');
    //   var top = 0;
    //   var button = holder.scrollHeight;
    //   var loadingMessages = filterAndGetLoadingMessages();
    //   if (loadingMessages.length > 0) {
    //     loadingMessages.forEach(function (LoadingMessage) {
    //       var loadingElement = getMessageElementById(LoadingMessage.id);
    //       if (loadingElement.offsetTop > top &&
    //         loadingElement.offsetTop < holder.scrollTop)
    //         top = loadingElement.offsetTop;
    //       if (loadingElement.offsetTop < button &&
    //         loadingElement.offsetTop > holder.scrollTop)
    //         button = loadingElement.offsetTop;
    //     });
    //   }
    //   scrollLimits = {
    //     'top': top,
    //     'button': button
    //   };
    // }

    document.getElementById('inputPlaceHolder').focus();

    angular.element(document.getElementById('messagesHolder'))
      .bind('scroll', function () {
        var scrollDirection;
        // if (scrollLimits) {
        var holder = document.getElementById('messagesHolder');
        var scrollTop = holder.scrollTop;
        if (prevScrollTop) {
          if (prevScrollTop > scrollTop)
            scrollDirection = 'up';
          else
            scrollDirection = 'down';
        }
        prevScrollTop = scrollTop;
        //   console.log('scroll top:', holder.scrollTop);111
        //   console.log('scroll height:', holder.scrollHeight);
        //   console.log('limits:', scrollLimits);
        //
        //   if (holder.scrollTop < scrollLimits.top) {
        //     holder.scrollTop = scrollLimits.top;
        //     getMessagePackagesIfLoadingsInView();
        //     console.log('TOP LIMIT EXCEEDED');
        //   }
        //   if (holder.scrollTop > scrollLimits.button) {
        //     holder.scrollTop = scrollLimits.button;
        //     getMessagePackagesIfLoadingsInView();
        //     console.log('BUTTON LIMIT EXCEEDED');
        //   }
        //   console.log('Scroll Limits:', scrollLimits);
        // }
        getMessagePackagesIfLoadingsInView(scrollDirection);
      });

    document.onkeydown = function (evt) {
      evt = evt || window.event;
      if (evt.keyCode == 27) {
        $state.go('messenger.home');
      }
    };

    // angular.element(document).ready(function () {
    //   updateScrollLimits();
    // });

    $scope.$on('tab:focus:changed', function () {
      if ($rootScope.isTabFocused)
        seenLastUnSeenMessage();
    });

  }
]);
