'use strict';

app.service('messagesService', [
  '$rootScope', '$http', '$log', '$q', 'socket',
  'channelsService', 'Message', 'Db', 'filesService', 'CurrentMember',
  'Team', 'ArrayUtil', 'FileManagerFile', 'CacheService',
  function ($rootScope, $http, $log, $q, socket, channelsService,
    Message, Db, filesService, CurrentMember, Team, ArrayUtil,
    FileManagerFile, CacheService) {

    var self = this;
    self.failedUploadedFiles = [];
    self.currentChannelMessages = [];
    var MESSAGE_MAX_PACKET_LENGTH = 20;

    /**
     * @summary Socket listeners
     */

    socket.on('message:send', function (data) {
      var message = new Message(data.body, data.type, data.senderId,
        data.channelId, data.id, data.datetime, data.additionalData,
        data.about, data.replyTo);
      message.save();
      updateCacheMessagesByChannelIdIfExists(message.channelId, message
        .getDbWellFormed());
      updateChannelMessagesIfActive(message.channelId, [message]);
      if (message.type === Message.TYPE.NOTIF)
        updateChannelMembersCount(message);
      setRepliedMessagesReplyPropertyIfChannelActive(message)
        .then(function () {
          $rootScope.$broadcast('message', message);
          channelsService.updateChannelLastDatetime(message.channelId,
            message.datetime);
          if (message.about) {
            filesService.showFileLine(message.about.fileId,
              message.about.lineNumber, message.about.lineNumberTo);
          }
        });
    });

    socket.on('message:type:start', function (data) {
      channelsService.addIsTypingMemberByChannelId(data.channelId, data
        .memberId);
      $rootScope.$broadcast('channels:updated');
      $rootScope.$broadcast('type:start', data.channelId);
    });

    socket.on('message:type:end', function (data) {
      channelsService.removeIsTypingMemberByChannelId(data.channelId,
        data.memberId);
      $rootScope.$broadcast('channels:updated');
    });

    socket.on('message:seen', function (data) {
      channelsService.updateChannelLastSeen(data.channelId, data.messageId);
    });

    /**
     * @summary RootScope listeners.
     */

    $rootScope.$on('channel:new', function (event, channel) {
      var promise;
      if (channel.isDirect() && channel.isFakeDirect) {
        var deferred = $q.defer();
        deferred.resolve();
        promise = deferred.promise;
      } else {
        promise = getAndSaveInitialMessagesByChannelFromServer(channel);
      }
      channel.setInitialMessagesPromise(promise);
      channelsService.addMessagesPromise(promise);
    });

    /**
     * @summary Methods
     */

    function getAndSaveInitialMessagesByChannelFromServer(channel) {
      var deferred = $q.defer();
      var periods = generateFromAndTo(channel.memberLastSeenId, channel.lastMessageId);
      var promises = periods.map(function (period) {
        return getInitialMessagesByChannelId(channel.id, channel.teamId,
          period.from, period.to);
      });
      return $q.all(promises);
    }

    function generateFromAndTo(memberLastSeenId, lastMessageId) {
      if (!lastMessageId)
        return [];
      var from = Math.max(memberLastSeenId - MESSAGE_MAX_PACKET_LENGTH / 4 +
        1, 1);
      var to = Math.min(memberLastSeenId + MESSAGE_MAX_PACKET_LENGTH * 3 / 4,
        lastMessageId);
      if (from === 1)
        to = Math.min(MESSAGE_MAX_PACKET_LENGTH, lastMessageId);
      if (to === lastMessageId)
        from = Math.max(lastMessageId - MESSAGE_MAX_PACKET_LENGTH + 1, 1);
      return generatePeriodsBasedOnLastMessages(lastMessageId, from, to);
    }

    function generatePeriodsBasedOnLastMessages(lastMessageId, from, to) {
      var periods = [];
      if (to < lastMessageId - MESSAGE_MAX_PACKET_LENGTH) {
        periods.push({
          from: from,
          to: to
        });
        periods.push({
          from: lastMessageId - MESSAGE_MAX_PACKET_LENGTH + 1,
          to: lastMessageId
        });
      } else {
        periods.push({
          from: from,
          to: lastMessageId
        });
      }
      return periods;
    }

    function bulkSaveMessage(messages) {
      var deferred = $q.defer();
      Db.getDb().then(function (database) {
        database.bulkDocs(messages)
          .then(function () {
            deferred.resolve();
          })
          .catch(function (err) {
            deferred.reject();
            $log.error('Bulk saving messages failed.', err);
          });
      });
      return deferred.promise;
    }

    function getMessagesRangeFromServer(channelId, teamId, fromId, toId,
      areLoadingMessagesGetting) {
      var deferred = $q.defer();
      getMessagesFromServer(channelId, teamId, fromId, toId)
        .then(function (messages) {
          var messagesForDb = messages.map(function (message) {
            return message.getDbWellFormed();
          });
          if (areLoadingMessagesGetting) {
            deferred.resolve(messages);
            bulkSaveMessage(messagesForDb);
          } else {
            bulkSaveMessage(messagesForDb)
              .then(function () {
                deferred.resolve();
              });
          }
        });
      return deferred.promise;
    }

    function setMessageReplyPropertyFromServer(message) {
      var deferred = $q.defer();
      getMessagesFromServer(message.channelId, message.teamId,
          message.replyTo, message.replyTo)
        .then(function (messages) {
          message.reply = messages[0];
          deferred.resolve();
        });
      return deferred.promise;
    }

    function getMessagesFromServer(channelId, teamId, fromId, toId) {
      var deferred = $q.defer();
      var dataToBeSend = {
        channelId: channelId,
        teamId: teamId,
        from: fromId,
        to: toId
      };
      socket.emit('message:get', dataToBeSend, function (res) {
        var messages = res.messages.map(function (msg) {
          return new Message(msg.body, msg.type, msg.senderId,
            msg.channelId, msg.id, msg.datetime, msg.additionalData,
            msg.about, msg.replyTo);
        });
        deferred.resolve(messages);
      });
      return deferred.promise;
    }

    function getMessagesByChannelId(channelId, lastMessageId) {
      var deferred = $q.defer();
      if (doesCacheContainsChannelMessages(channelId)) {
        var messages = getChannelCachedMessageModels(channelId);
        makeMessagesReadyForView(messages, channelId, lastMessageId)
          .then(function () {
            deferred.resolve(messages);
          });
      } else {
        getMessagesByChannelIdFromDb(channelId)
          .then(function (messagesData) {
            cacheChannelMessagesData(channelId, messagesData.docs);
            var messages = generateMessageModelsFromData(messagesData.docs);
            makeMessagesReadyForView(messages, channelId, lastMessageId)
              .then(function () {
                deferred.resolve(messages);
              });
          });
      }
      return deferred.promise;
    }

    function generateMessageModelsFromData(messagesData) {
      return messagesData.map(function (message) {
        return new Message(message.body, message.type,
          message.senderId, message.channelId, message._id,
          message.datetime, message.additionalData, message.about,
          message.replyTo
        );
      });
    }

    function pushFailedUploadedFilesIntoMessagesByCahnnelId(messages,
      channelId) {
      var channelFailedUploadedFiles =
        getFailedUploadedFilesByChannelId(channelId);
      channelFailedUploadedFiles.forEach(function (data) {
        messages.push(data.message);
      });
    }

    function getChannelCachedMessageModels(channelId) {
      var messagesData = getMessagesDataByChannelIdFromCache(channelId);
      return generateMessageModelsFromData(messagesData);
    }

    function makeMessagesReadyForView(messages, channelId, lastMessageId) {
      var deferred = $q.defer();
      setRepliedMessagesReplyProperty(messages, messages)
        .then(function () {
          generateLoadingMessages(messages, channelId, lastMessageId);
          pushFailedUploadedFilesIntoMessagesByCahnnelId(messages,
            channelId);
          setActiveChannelMessages(messages);
          deferred.resolve();
        });
      return deferred.promise;
    }

    function setRepliedMessagesReplyProperty(messages, channelMessages) {
      var repliesPromise = [];
      messages.forEach(function (message) {
        if (message.replyTo) {
          var replyMessage = ArrayUtil.getElementByKeyValue(
            channelMessages, 'id', message.replyTo);
          if (replyMessage)
            message.reply = replyMessage;
          else {
            var promise = setMessageReplyPropertyFromServer(message);
            repliesPromise.push(promise);
          }
        }
      });
      return $q.all(repliesPromise);
    }

    function setRepliedMessagesReplyPropertyIfChannelActive(message) {
      var deferred = $q.defer();
      if (isChannelIdActiveChannel(message.channelId))
        setRepliedMessagesReplyProperty([message], self.currentChannelMessages)
        .then(function () {
          deferred.resolve();
        });
      else
        deferred.resolve();
      return deferred.promise;
    }

    function generateLoadingMessages(messages, channelId, lastMessageId) {
      if (messages.length > 0) {
        var firstDbMessageId = messages[0].id;
        var lastDbMessageId = messages[messages.length - 1].id;
        generateMainLoadingMessages(messages, channelId);
        generateUpperLoadingMessages(messages, channelId, firstDbMessageId);
        generateLowerLoadingMessages(messages, channelId, lastMessageId,
          lastDbMessageId);
      } else {
        generateUpperLoadingMessages(messages, channelId, lastMessageId);
      }
    }

    function generateMainLoadingMessages(messages, channelId) {
      for (var i = 0; i < messages.length; i++) {
        if (i !== messages.length - 1) {
          if (messages[i + 1].id - messages[i].id > 1) {
            createAndPushLoadingMessage(messages, channelId, messages[i].id +
              1,
              messages[i + 1].id - 1);
          }
        }
      }
    }

    function generateUpperLoadingMessages(messages, channelId,
      firstDbMessageId) {
      var packetStartPoint = firstDbMessageId - 1;
      for (var i = firstDbMessageId - 1; i > 0; i--) {
        if (packetStartPoint - i >= MESSAGE_MAX_PACKET_LENGTH - 1 || (i ===
            1)) {
          createAndPushLoadingMessage(messages, channelId, i,
            packetStartPoint);
          packetStartPoint = i - 1;
        }
      }
    }

    function generateLowerLoadingMessages(messages, channelId, lastMessageId,
      lastDbMessageId) {
      var packetStartPoint = lastDbMessageId + 1;
      for (var i = lastDbMessageId + 1; i <= lastMessageId; i++) {
        if (i - packetStartPoint >= MESSAGE_MAX_PACKET_LENGTH - 1 ||
          (i === lastMessageId - 1)) {
          createAndPushLoadingMessage(messages, channelId, packetStartPoint,
            i);
          packetStartPoint = i + 1;
        }
      }
    }

    function createAndPushLoadingMessage(messages, channelId, fromId, toId) {
      var additionalData = {
        channelId: channelId,
        from: fromId,
        to: toId
      };
      if (toId - fromId < MESSAGE_MAX_PACKET_LENGTH) {
        var loadingMessage = new Message(null, Message.TYPE.LOADING, null,
          channelId, null, null, additionalData);
        loadingMessage.setId(fromId);
        messages.push(loadingMessage);
      } else {
        createAndPushLoadingMessage(messages, channelId, fromId, fromId +
          MESSAGE_MAX_PACKET_LENGTH - 1);
        createAndPushLoadingMessage(messages, channelId, fromId +
          MESSAGE_MAX_PACKET_LENGTH,
          toId);
      }
    }

    /**
     * @todo Create a static variable for limit count.
     */
    function getMessagesByChannelIdFromDb(channelId) {
      var deferred = $q.defer();
      Db.getDb().then(function (database) {
        database.find({
          selector: {
            id: {
              $gt: null
            },
            channelId: {
              $eq: channelId
            }
          },
          sort: [{
            id: 'desc'
          }],
          limit: 2 * MESSAGE_MAX_PACKET_LENGTH
        }).then(function (docs) {
          ArrayUtil.sortByKeyAsc(docs.docs, 'id');
          deferred.resolve(docs);
        });
      });
      return deferred.promise;
    }

    function getLoadingMessagesByChannelId(channelId, teamId, from, to,
      shouldSkipDb) {
      var deferred = $q.defer();
      getDbAndServerLoadingMessages(channelId, teamId, from, to,
          shouldSkipDb)
        .then(function (messages) {
          var messagesForDb = messages.map(function (message) {
            return message.getDbWellFormed();
          });
          updateCacheMessagesByChannelId(channelId, messagesForDb);
          updateActiveChannelMessages(messages);
          setRepliedMessagesReplyProperty(messages, self.currentChannelMessages)
            .then(function () {
              deferred.resolve(messages);
            });
        });
      return deferred.promise;
    }

    function getDbAndServerLoadingMessages(channelId, teamId, from, to,
      shouldSkipDb) {
      return getPrimaryMessagesByChannelIdFromDb(channelId, from, to, true,
          shouldSkipDb)
        .then(function (messagesData) {
          var messages = generateMessageModelsFromData(messagesData);
          if (to - from + 1 !== messagesData.length) {
            var ids = [];
            messagesData.forEach(function (messageData) {
              ids.push({
                id: messageData.id
              });
            });
            var gaps = findGaps(ids, from, to);
            var promises = gaps.map(function (gap) {
              return getMessagesRangeFromServer(channelId, teamId,
                gap.from, gap.to, true);
            });
            return $q.all(promises)
              .then(function () {
                promises.forEach(function (promise) {
                  messages = messages.concat(promise.$$state.value);
                });
                ArrayUtil.sortByKeyAsc(messages, 'id');
                return messages;
              });
          } else return messages;
        });
    }

    function getInitialMessagesByChannelId(channelId, teamId, from, to) {
      return getPrimaryMessagesByChannelIdFromDb(channelId, from, to)
        .then(function (ids) {
          var gaps = findGaps(ids, from, to);
          if (gaps.length) {
            var promises = gaps.map(function (gap) {
              return getMessagesRangeFromServer(channelId, teamId,
                gap.from, gap.to);
            });
            return $q.all(promises);
          }
        });
    }

    function getPrimaryMessagesByChannelIdFromDb(channelId, from, to,
      areLoadingMessagesGetting, shouldSkipDb) {
      var deferred = $q.defer();
      if (shouldSkipDb) {
        deferred.resolve([]);
        return deferred.promise;
      }
      var queryField = ['id'];
      if (areLoadingMessagesGetting)
        queryField = null;
      Db.getDb().then(function (database) {
        database.find({
          selector: {
            id: {
              $gt: from - 1,
              $lt: to + 1
            },
            channelId: {
              $eq: channelId
            }
          },
          fields: queryField,
          sort: [{
            id: 'asc'
          }],
        }).then(function (data) {
          deferred.resolve(data.docs);
        });
      });
      return deferred.promise;
    }

    function findGaps(ids, from, to) {
      var gaps = [];
      var diff = 0;
      for (var i = from; i <= to; i++) {
        if (ids[i - from - diff]) {
          if (i === ids[i - from - diff].id)
            continue;
          else {
            gaps.push({
              from: i,
              to: ids[i - from - diff].id - 1
            });
            var tempdiff = ids[i - from - diff].id - i;
            i = ids[i - from - diff];
            diff += tempdiff;
          }
        } else {
          gaps.push({
            from: i,
            to: to
          });
          break;
        }
      }
      return gaps;
    }

    function sendAndGetMessage(channelId, messageBody, replyMessage) {
      var replyId = null;
      var about = null;
      var livedFile = filesService.getLivedFile();
      if (livedFile) {
        var tempLines = livedFile.getTempLines();
        if (tempLines)
          about = {
            fileId: livedFile.id,
            lineNumber: tempLines.start,
            lineNumberTo: tempLines.end
          };
        livedFile.deselectTempLines();
      }
      if (replyMessage)
        replyId = replyMessage.id;
      var message = new Message(messageBody, Message.TYPE.TEXT,
        CurrentMember.member.id, channelId, null, null, null,
        about, replyId, true);
      if (replyMessage)
        message.reply = replyMessage;
      socket.emit('message:send', message.getServerWellFormed(),
        function (data) {
          message.isPending = false;
          message.setIdAndDatetime(data.id, data.datetime, data.additionalData);
          message.save();
          updateCacheMessagesByChannelId(message.channelId,
            message.getDbWellFormed());
          updateActiveChannelMessages([message]);
          channelsService.updateChannelLastDatetime(message.channelId,
            message.datetime);
        });
      return message;
    }

    function sendFileAndGetMessage(channelId, fileData, replyMessage) {
      var replyId = null;
      var additionalData = {
        name: fileData.name
      };
      if (replyMessage)
        replyId = replyMessage.id;
      var message = new Message(null, Message.TYPE.FILE,
        CurrentMember.member.id, channelId, null, null, additionalData,
        null, replyId, true, +new Date());
      if (replyMessage)
        message.reply = replyMessage;
      uploadFile(message, fileData);
      return message;
    }

    function reuploadFile(fileTimestamp) {
      var data = getFailedUploadedFileByTimestamp(fileTimestamp);
      data.message.isFailed = false;
      uploadFile(data.message, data.fileData);
    }

    function setUploadedFileMessageDetails(message, result) {
      message.additionalData.url = result.file;
      message.additionalData.fileId = result.id;
      message.additionalData.type = result.type;
      socket.emit('message:send', message.getServerWellFormed(),
        function (res) {
          message.isPending = false;
          message.setIdAndDatetime(res.id, res.datetime, res.additionalData);
          message.save();
          updateCacheMessagesByChannelIdIfExists(message.channelId,
            message.getDbWellFormed());
          updateChannelMessagesIfActive(message.channelId, [message]);
          channelsService.updateChannelLastDatetime(message.channelId,
            message.datetime);
        });
      filesService.createFileManagerFile(result.id, result.file, result.name,
        result.date_uploaded, result.type);
    }

    function updateFailedUploadedFiles(message, fileData) {
      message.isFailed = true;
      self.failedUploadedFiles.push({
        fileData: fileData,
        message: message
      });
    }

    function uploadFile(message, fileData) {
      filesService.uploadFile(fileData.name, message.channelId,
          CurrentMember.member.id, fileData, message)
        .then(function (res) {
          setUploadedFileMessageDetails(message, res.data);
        }).catch(function (err) {
          updateFailedUploadedFiles(message, fileData);
        });
    }

    function getFailedUploadedFileByTimestamp(fileTimestamp) {
      var data = ArrayUtil.getElementByKeyValue(self.failedUploadedFiles,
        'message.fileTimestamp', fileTimestamp);
      removeUploadFailedFileByFileTimestamp(fileTimestamp);
      return data;
    }

    function removeUploadFailedFileByFileTimestamp(fileTimestamp) {
      ArrayUtil.removeElementByKeyValue(self.failedUploadedFiles,
        'message.fileTimestamp', fileTimestamp);
    }

    function seenMessage(channelId, messageId, senderId) {
      var data = {
        channelId: channelId,
        teamId: channelsService.getCurrentChannel().teamId,
        messageId: messageId,
        senderId: senderId
      };
      socket.emit('message:seen', data);
      channelsService.updateChannelNotification(channelId, 'empty');
    }

    function getFailedUploadedFilesByChannelId(channelId) {
      return self.failedUploadedFiles.filter(function (data) {
        return data.message.channelId === channelId;
      });
    }

    function findClosestLoadingMessage(loadingMessages, messageId) {
      if (!loadingMessages.length)
        return null;
      var idDifference = Math.abs(loadingMessages[0].id - messageId);
      var loadingMessageId = loadingMessages[0].id;
      loadingMessages.forEach(function (loadingMessage) {
        if (Math.abs(loadingMessage.id - messageId) < idDifference) {
          loadingMessageId = loadingMessage.id;
          idDifference = Math.abs(loadingMessage.id - messageId);
        }
      });
      if (idDifference < MESSAGE_MAX_PACKET_LENGTH / 2)
        return ArrayUtil.getElementByKeyValue(loadingMessages, 'id',
          loadingMessageId);
      return null;
    }

    function findLoadingMessageContainsReplyMessage(loadingMessages, id) {
      var loadingMessageId;
      for (var i = 0; i < loadingMessages.length; i++) {
        if (loadingMessages[i].id - id <= 0)
          return loadingMessages[i];
      }
    }

    function updateChannelMembersCount(message) {
      var channel = channelsService.findChannelById(message.channelId);
      if (message.type === Message.TYPE.NOTIF.USER_ADDED)
        channel.membersCount = channel.membersCount +
        message.additionalData.length;
      else if (message.type === Message.TYPE.NOTIF.USER_REMOVED)
        channel.membersCount--;
    }

    function startTyping(channelId) {
      var data = {
        channelId: channelId
      };
      socket.emit('message:type:start', data);
    }

    function endTyping(channelId) {
      var data = {
        channelId: channelId
      };
      socket.emit('message:type:end', data);
    }

    function doesCacheContainsChannelMessages(channelId) {
      return CacheService.getCache().has(channelId);
    }

    function getMessagesDataByChannelIdFromCache(channelId) {
      return CacheService.getCache().get(channelId);
    }

    function cacheChannelMessagesData(channelId, messages) {
      return CacheService.getCache().set(channelId, messages);
    }

    function updateCacheMessagesByChannelId(channelId, messages) {
      var cache = getMessagesDataByChannelIdFromCache(channelId);
      cache = cache.concat(messages);
      ArrayUtil.sortByKeyAsc(cache, 'id');
      cacheChannelMessagesData(channelId, cache);
    }

    function updateCacheMessagesByChannelIdIfExists(channelId, messages) {
      if (doesCacheContainsChannelMessages(channelId))
        updateCacheMessagesByChannelId(channelId, messages);
    }

    function isChannelIdActiveChannel(channelId) {
      var currentChannel = channelsService.getCurrentChannel();
      if (currentChannel)
        return channelsService.getCurrentChannel().id === channelId;
      return false;
    }

    function setActiveChannelMessages(messages) {
      self.currentChannelMessages = messages;
    }

    function updateActiveChannelMessages(messages) {
      self.currentChannelMessages = self.currentChannelMessages.concat(
        messages);
    }

    function updateChannelMessagesIfActive(channelId, messages) {
      if (isChannelIdActiveChannel(channelId))
        updateActiveChannelMessages(messages);
    }

    /**
     * @summary Public API
     */

    return {
      getMessagesByChannelId: getMessagesByChannelId,
      getLoadingMessagesByChannelId: getLoadingMessagesByChannelId,
      sendAndGetMessage: sendAndGetMessage,
      sendFileAndGetMessage: sendFileAndGetMessage,
      reuploadFile: reuploadFile,
      getMessagesRangeFromServer: getMessagesRangeFromServer,
      removeUploadFailedFileByFileTimestamp: removeUploadFailedFileByFileTimestamp,
      seenMessage: seenMessage,
      findClosestLoadingMessage: findClosestLoadingMessage,
      findLoadingMessageContainsReplyMessage: findLoadingMessageContainsReplyMessage,
      startTyping: startTyping,
      endTyping: endTyping,
    };
  }
]);
