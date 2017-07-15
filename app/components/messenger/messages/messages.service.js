'use strict';

app.service('messagesService', [
  '$rootScope', '$http', '$log', '$q', 'Upload', 'socket',
  'channelsService', 'Message', 'db', 'filesService', 'CurrentMember',
  'Team', 'ArrayUtil',
  function ($rootScope, $http, $log, $q, Upload, socket, channelsService,
    Message, db, filesService, CurrentMember, Team, ArrayUtil) {

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
      generateFromAndTo(channel.memberLastSeenId,channel.lastMessageId).then(function (period) {
        getInitialMessagesByChannelId(channel.id, channel.teamId, period.from, period.to).then(function () {
          deferred.resolve();
        }).catch(function (err) {
          $log.error('Error Getting Initial Messages From Server', err);
        });
      });
      return deferred.promise;
    }

    function generateFromAndTo(memberLastSeenId,lastMessageId) {
      var deferred = $q.defer();
      var from;
      var to;
      if (memberLastSeenId) {
        from = Math.max(memberLastSeenId - Message.MAX_PACKET_LENGTH / 4, 1);
        to = Math.min(memberLastSeenId + Message.MAX_PACKET_LENGTH * 3 / 4,
          lastMessageId);
          if (from === 1)
          to = Math.min(Message.MAX_PACKET_LENGTH, lastMessageId);
          if (to === lastMessageId)
          from = Math.max(lastMessageId - Message.MAX_PACKET_LENGTH + 1, 1);
        } else {
        from = 1;
        to = Math.min(Message.MAX_PACKET_LENGTH, lastMessageId);
      }
      deferred.resolve({from:from,to:to});
      return deferred.promise;
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

    function getNeededMessagesFromServer(channelId, teamId, fromId, toId) {
      var messagesForDb = [];
      var messagesForView = [];
      var deferred = $q.defer();
      var dataToBeSend = {
        channelId: channelId,
        teamId: teamId,
        from: fromId,
        to: toId
      };
      socket.emit('message:get', dataToBeSend, function (res) {
        if (res && res.messages) {
          res.messages.forEach(function (msg) {
            var message = new Message(msg.body, msg.type,
              msg.senderId,
              msg.channelId, msg.id, msg.datetime,
              msg.additionalData, msg.about);
            messagesForDb.push(message.getDbWellFormed());
            messagesForView.push(message);
          });
          if (messagesForDb.length > 0) {
            bulkSaveMessage(messagesForDb).then(function () {
              deferred.resolve(messagesForView);
            }).catch(function (err) {
              $log.error('Error Saving Initila Messages To DB', err);
            });
          } else {
            deferred.resolve(messagesForView);
          }
        } else {
          deferred.reject();
        }
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
          // limit: 200
        }).then(function (docs) {
          deferred.resolve(docs);
        });
      });
      return deferred.promise;
    }

    function getInitialMessagesByChannelId(channelId, teamId, from, to) {
      var deferred = $q.defer();
      getInitialMessagesByChannelIdFromDb(channelId, from, to)
        .then(function (res) {
          findGaps(res, from, to).then(function (gaps) {
            if (gaps)
              for (var i = 0; i < gaps.length; i++)
                getNeededMessagesFromServer(channelId, teamId, gaps[i].from,gaps[i].to);
                deferred.resolve();
          });
        });
      return deferred.promise;
    }

    function getInitialMessagesByChannelIdFromDb(channelId, from, to) {
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
        }).then(function (docs) {
          deferred.resolve(docs);
        });
      });
      return deferred.promise;
    }

    function findGaps(res, from, to) {
      var deferred = $q.defer();
      var gaps = [];
      var diff = 0;
      for (var i = from; i <= to; i++) {
        if (res.docs[i - from - diff]) {
          if (i === res.docs[i - from - diff].id)
            continue;
          else {
            gaps.push({
              from: i,
              to: res.docs[i - from - diff].id - 1
            });
            var tempdiff = res.docs[i - from - diff].id - i;
            i = res.docs[i - from - diff];
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
      deferred.resolve(gaps);
      return deferred.promise;
    }

    function getLastMessageByChannelIdFromDb(channelId) {
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
            id: 'desc'
          }],
          limit: 1
        }).then(function (result) {
          if (result.docs.length === 0) {
            deferred.resolve(null);
          } else {
            deferred.resolve(result.docs[0]);
          }
        }).catch(function (err) {
          $log.error('Getting last message from db failed.', err);
          deferred.reject();
        });
      });
      return deferred.promise;
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
      var message = new Message(null, Message.TYPE.FILE, CurrentMember.member
        .id, channelId, null, null, additionalData, null, true, +new Date()
      );
      Upload.upload({
        url: 'api/v1/files/upload/' + fileName,
        data: {
          name: fileName,
          channel: channelId,
          sender: CurrentMember.member.id,
          file: fileData
        },
        method: 'PUT'
      }).then(function (res) {
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
      }, function (resp) {
        $log.error('Error status: ' + resp.status);
      }, function (evt) {
        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
        $rootScope.$broadcast('file:upload:progress',
          progressPercentage);
      });
      return message;
    }

    function getFileManagerFiles(channelId) {
      var deferred = $q.defer();
      var data =[];
      var data1={name:'irani.jpg',date:2017,size:13};
      data.push(data1);
      data1 = {name:'iran.jpg',date:2016,size:133};
      data.push(data1);
      deferred.resolve(data);
      return deferred.promise;
      $http({
        method: 'GET',
        url: '/api/v1/messenger/channe/' + channelId + '/members/'
      }).then(function (data) {
        deferred.resolve(data);
      }).catch(function (err) {
        $log.info('Error Getting FileManager Files.', err);
        deferred.reject(err);
      });
      return deferred.promise;
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

    function seenLastMessageByChannelId(channelId) {
      getLastMessageByChannelIdFromDb(channelId)
        .then(function (lastMessage) {
          if (lastMessage) {
            seenMessage(channelId, lastMessage.id, lastMessage.senderId);
          }
        });
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
      getFileManagerFiles: getFileManagerFiles,
      getNeededMessagesFromServer: getNeededMessagesFromServer,
      seenMessage: seenMessage,
      seenLastMessageByChannelId: seenLastMessageByChannelId,
      startTyping: startTyping,
      endTyping: endTyping,
    };
  }
]);
