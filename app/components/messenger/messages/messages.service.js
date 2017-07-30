'use strict';

app.service('messagesService', [
  '$rootScope', '$http', '$log', '$q', 'socket',
  'channelsService', 'Message', 'db', 'filesService', 'CurrentMember',
  'Team', 'ArrayUtil', 'FileManagerFile',
  function ($rootScope, $http, $log, $q, socket, channelsService,
    Message, db, filesService, CurrentMember, Team, ArrayUtil,
    FileManagerFile) {

    var self = this;
    /**
     * @summary Socket listeners
     */

    socket.on('message:send', function (data) {
      var message = new Message(data.body, data.type, data.senderId,
        data.channelId, data.id, data.datetime, data.additionalData,
        data.about);
      message.save();
      if (message.type === Message.TYPE.NOTIF) {
        var channel = channelsService.findChannelById(message.channelId);
        if (message.type === Message.TYPE.NOTIF.USER_ADDED)
          channel.membersCount = channel.membersCount + message.additionalData
          .length;
        else if (message.type === Message.TYPE.NOTIF.USER_REMOVED)
          channel.membersCount--;
      }
      $rootScope.$broadcast('message', message);
      channelsService.updateChannelLastDatetime(message.channelId,
        message.datetime);
      if (message.about) {
        filesService.showFileLine(message.about.fileId, message.about.lineNumber,
          message.about.lineNumberTo);
      }
    });

    socket.on('message:type:start', function (data) {
      channelsService.addIsTypingMemberByChannelId(data.channelId, data
        .memberId);
      $rootScope.$broadcast('channels:updated');
      $rootScope.$broadcast('scroll:isTyping');
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
      console.log(promises);
      return $q.all(promises);
    }

    function generateFromAndTo(memberLastSeenId, lastMessageId) {
      var from = Math.max(memberLastSeenId - Message.MAX_PACKET_LENGTH / 4 +
        1,
        1);
      var to = Math.min(memberLastSeenId + Message.MAX_PACKET_LENGTH * 3 / 4,
        lastMessageId);
      if (from === 1)
        to = Math.min(Message.MAX_PACKET_LENGTH, lastMessageId);
      if (to === lastMessageId)
        from = Math.max(lastMessageId - Message.MAX_PACKET_LENGTH + 1, 1);
      return generatePeriodsBasedOnLastMessages(lastMessageId, from, to);
    }

    function generatePeriodsBasedOnLastMessages(lastMessageId, from, to) {
      var periods = [];
      if (to < lastMessageId - Message.MAX_PACKET_LENGTH) {
        periods.push({
          from: from,
          to: to
        });
        periods.push({
          from: lastMessageId - Message.MAX_PACKET_LENGTH + 1,
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
      db.getDb().then(function (database) {
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

    function getMessagesRangeFromServer(channelId, teamId, fromId, toId) {
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
            msg.about);
        });
        deferred.resolve(messages);
        var messagesForDb = messages.map(function (message) {
          return message.getDbWellFormed();
        });
        bulkSaveMessage(messagesForDb);
      });
      return deferred.promise;
    }

    function getMessagesByChannelId(channelId) {
      var deferred = $q.defer();
      getMessagesByChannelIdFromDb(channelId)
        .then(function (res) {
          var messages = [];
          res.docs.forEach(function (doc) {
            var message = new Message(doc.body, doc.type, doc.senderId,
              doc.channelId, doc._id, doc.datetime, doc.additionalData,
              doc.about);
            messages.push(message);
          });
          deferred.resolve(messages);
        });
      return deferred.promise;
    }


    /**
     * @todo Create a static variable for limit count.
     */
    function getMessagesByChannelIdFromDb(channelId) {
      var deferred = $q.defer();
      db.getDb().then(function (database) {
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
            id: 'asc'
          }],
        }).then(function (docs) {
          deferred.resolve(docs);
        });
      });
      return deferred.promise;
    }

    function getInitialMessagesByChannelId(channelId, teamId, from, to) {
      return getInitialMessagesIdByChannelIdFromDb(channelId, from, to)
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

    function getInitialMessagesIdByChannelIdFromDb(channelId, from, to) {
      var deferred = $q.defer();
      db.getDb().then(function (database) {
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
          fields: ['id'],
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

    function sendAndGetMessage(channelId, messageBody, type, fileName,
      fileUrl) {
      var additionalData = null;
      var about = null;
      if (fileName) {
        additionalData = {
          name: fileName,
          url: fileUrl
        };
      }
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
      var message = new Message(messageBody, type || Message.TYPE.TEXT,
        CurrentMember.member.id, channelId, null, null, additionalData,
        about, true);
      socket.emit('message:send', message.getServerWellFormed(),
        function (data) {
          message.isPending = false;
          message.setIdAndDatetime(data.id, data.datetime, data.additionalData);
          message.save();
          channelsService.updateChannelLastDatetime(message.channelId,
            message.datetime);
        });
      return message;
    }

    function sendFileAndGetMessage(channelId, fileData, fileName) {
      var additionalData = {
        name: fileName
      };
      var message = new Message(null, Message.TYPE.FILE,
        CurrentMember.member.id, channelId, null, null, additionalData,
        null, true, +new Date());
      filesService.uploadFile(fileName, channelId, CurrentMember.member.id,
          fileData, message)
        .then(function (res) {
          message.additionalData.url = res.data.file;
          message.additionalData.fileId = res.data.id;
          message.additionalData.type = res.data.type;
          socket.emit('message:send', message.getServerWellFormed(),
            function (data) {
              message.isPending = false;
              message.setIdAndDatetime(data.id, data.datetime, data.additionalData);
              message.save();
              channelsService.updateChannelLastDatetime(message.channelId,
                message.datetime);
            });
          var file = new FileManagerFile(res.data.id, res.data.file, res.data
            .name, res.data.date_uploaded, res.data.type);
          $rootScope.$broadcast('file:newFileManagerFile', file);
        }).catch(function (err) {
          $log.error('Error Uploading File.', err);
        });
      return message;
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

    /**
     * @summary Public API
     */

    return {
      getMessagesByChannelId: getMessagesByChannelId,
      sendAndGetMessage: sendAndGetMessage,
      sendFileAndGetMessage: sendFileAndGetMessage,
      getMessagesRangeFromServer: getMessagesRangeFromServer,
      seenMessage: seenMessage,
      startTyping: startTyping,
      endTyping: endTyping,
    };
  }
]);
