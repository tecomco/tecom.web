'use strict';

app.service('messagesService', [
  '$rootScope', '$http', '$log', '$q', 'Upload', 'socket', 'channelsService',
  'Message', 'db', 'User', 'filesService',
  function ($rootScope, $http, $log, $q, Upload, socket, channelsService,
            Message, db, User, filesService) {

    var self = this;

    /**
     * @summary Socket listeners
     */

    socket.on('message:send', function (data) {
      var message = new Message(data.body, data.type, data.senderId,
        data.channelId, data.id, data.datetime, data.additionalData, data.about);
      message.save();
      $rootScope.$broadcast('message', message);
      channelsService.updateChannelLastDatetime(message.channelId,
        message.datetime);
      if (message.about) {
        filesService.showFileLine(message.about.fileId, message.about.lineNumber,
          message.about.lineNumberTo);
      }
    });

    socket.on('message:type:start', function (data) {
      channelsService.addIsTypingMemberByChannelId(data.channelId, data.memberId);
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
      if (channel.isDirect() && !channel.isDirectExist()) {
        var deferred = $q.defer();
        deferred.resolve();
        promise = deferred.promise;
      } else {
        promise = getAndSaveNewMessagesByChannelFromServer(channel);
      }
      channelsService.addMessagesPromise(promise);
    });

    /**
     * @summary Methods
     */

    function getAndSaveNewMessagesByChannelFromServer(channel) {
      var deferred = $q.defer();
      var messagePromises = [];
      var messages = [];
      var dataToBeSend = {
        channelId: channel.id,
        teamId: channel.teamId
      };
      messagePromises.push(new Promise(function (resolve) {
        getLastMessageByChannelIdFromDb(channel.id)
          .then(function (lastMessage) {
            if (lastMessage) {
              dataToBeSend.lastSavedMessageId = lastMessage.id;
            }
            socket.emit('message:get', dataToBeSend, function (res) {
              $log.info('DEBUG - Messages from server count:', res.messages.length, channel.slug);
              channelsService.updateChannelNotification(channel.id, 'num',
                res.notifCount);
              if (res.lastDatetime) {
                channelsService.updateChannelLastDatetime(channel.id,
                  new Date(res.lastDatetime));
              }
              if (res.channelLastSeen) {
                channelsService.updateChannelLastSeen(channel.id,
                  res.channelLastSeen);
              }
              res.messages.forEach(function (msg) {
                var message = new Message(msg.body, msg.type, msg.senderId,
                  msg.channelId, msg.id, msg.datetime, msg.additionalData, msg.about);
                messages.push(message.getDbWellFormed());
              });
              resolve();
            });
          });
      }));
      Promise.all(messagePromises).then(function () {
        $log.info('DEBUG - All messages promises in MessageService resolved.', channel.slug);
        if (messages.length > 0) {
          bulkSaveMessage(messages).then(function () {
            $log.info('DEBUG - Bulk saved.', channel.slug);
            deferred.resolve();
          });
        } else {
          deferred.resolve();
        }
      });
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

    function getMessagesByChannelId(channelId) {
      var deferred = $q.defer();
      getMessagesByChannelIdFromDb(channelId)
        .then(function (res) {
          var messages = [];
          res.docs.forEach(function (doc) {
            var message = new Message(doc.body, doc.type, doc.senderId,
              doc.channelId, doc._id, doc.datetime, doc.additionalData, doc.about);
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
            id: 'desc'
          }],
          limit: 200
        }).then(function (docs) {
          deferred.resolve(docs);
        });
      });
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

    function sendAndGetMessage(channelId, messageBody, type, fileName, fileUrl) {
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
        User.getCurrent().memberId, channelId, null, null, additionalData, about, true);
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
      var message = new Message(null, Message.TYPE.FILE, User.getCurrent().memberId,
        channelId, null, null, additionalData, null, true);
      Upload.upload({
        url: 'api/v1/files/upload/' + fileName,
        data: {
          name: fileName,
          channel: channelId,
          sender: User.getCurrent().memberId,
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
      }).catch(function (err) {
        /**
         * @todo Handle upload errors properly.
         */
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
      seenMessage: seenMessage,
      seenLastMessageByChannelId: seenLastMessageByChannelId,
      startTyping: startTyping,
      endTyping: endTyping,
    };
  }
]);
