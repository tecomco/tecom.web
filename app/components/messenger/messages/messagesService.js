'use strict';

app.service('messagesService',
  ['$log', '$q', 'socket', 'Message', '$stateParams', 'db', 'User',
    function ($log, $q, socket, Message, $stateParams, db, User) {

      var self = this;

      socket.on('message:seen', function (data) {
        $log.info('seen:', data);
        var channel = self.findChannelCallback(data.channelId);
        channel.channelLastSeen = data.messageId;
        if ($stateParams.channel && $stateParams.channel.id === data.channelId)
          self.updateMessageStatusCallback(data.messageId, Message.STATUS_TYPE.SEEN);
        getMessageFromDbWithChannelAndId(data.channelId, data.messageId)
          .then(function (message) {
            if (message.senderId !== User.id)
              self.updateNotification(message.channelId, 'empty');
          });
      });

      socket.on('message:send', function (data) {
        $log.info('message:send', data);
        var message = new Message(data.body, data.senderId, data.channelId,
          data.id, data.datetime);
        message.save();
        if ($stateParams.channel && message.channelId === $stateParams.channel.id) {
          self.ctrlCallback(message);
          sendSeenNotif(message.channelId, message.id, message.senderId);
        }
        else if (message.senderId !== User.id) {
          self.updateNotification(message.channelId, 'inc');
        }
        self.updateLastDatetimeCallback(message.channelId, message.datetime);

      });

      function updateMessageStatus(channelId, messageId) {

      }

      function sendMessage(data, callback) {
        socket.emit('message:send', data, callback);
      }

      function setCtrlCallback(callback) {
        self.ctrlCallback = callback;
      }

      function getMessagesFromDb(channelId, callback) {
        db.getDb().find({
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
          limit: 50
        }).then(function (result) {
          callback(result.docs);
        });
      }

      function getLastMessageFromDb(channelId) {
        return new Promise(function (resolve) {
          db.getDb().find({
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
              resolve(null);
            } else {
              resolve(result.docs[0]);
            }
          }).catch(function (err) {
            $log.error('Error getting last message from db.', err);
          });
        });
      }

      function getMessageFromDbWithChannelAndId(channelId, messageId) {
        return new Promise(function (resolve) {
          db.getDb().find({
            selector: {
              id: {
                $eq: messageId
              },
              channelId: {
                $eq: channelId
              }
            },
            limit: 1
          }).then(function (result) {
            if (result.docs.length === 0) {
              resolve(null);
            } else {
              resolve(result.docs[0]);
            }
          }).catch(function (err) {
            $log.error('Error getting message with channel and id', err);
          });
        });
      }

      function getNewMessagesFromServer(channels) {
        var messagePromises = [];
        var allMessages = [];
        channels.forEach(function (channel) {
          var dataToBeSend = {
            channelId: channel.id
          };
          messagePromises.push(new Promise(function (resolve) {
            getLastMessageFromDb(channel.id).then(function (lastMessage) {
              if (lastMessage !== null) {
                dataToBeSend.lastSavedMessageId = lastMessage.id;
                channel.lastMessageDatetime = lastMessage.datetime;
              }
              socket.emit('message:get', dataToBeSend, function (res) {
                self.updateNotification(channel.id, 'num', res.notifCount);
                if (res.lastDatetime)
                  channel.lastDatetime = new Date(res.lastDatetime);
                if (res.channelLastSeen)
                  channel.channelLastSeen = res.channelLastSeen;
                if (channel.id === self.requestedChannelReadyId)
                  self.promissChannelReady.resolve(true);
                var channelMessagesData = res.messages;
                channelMessagesData.forEach(function (msg) {
                  var message = new Message(msg.body, msg.senderId,
                    msg.channelId, msg.id, msg.datetime);
                  allMessages.push(message);
                });
                resolve();
              });
            });
          }));
        });
        Promise.all(messagePromises).then(function () {
          self.allChannelsReady = true;
          Message.bulkSave(allMessages);
        });
      }

      var sendSeenNotif = function (channelId, lastMessageId, senderId) {
        if (senderId !== User.id) {
          var data = {
            channelId: channelId,
            messageId: lastMessageId,
            senderId: senderId
          };
          socket.emit('message:seen', data);
        }
      };

      var setUpdateNotificationCallback = function (updateFunc) {
        self.updateNotification = updateFunc;
      };

      var setUpdateLastDatetimeCallback = function (updateFunc) {
        self.updateLastDatetimeCallback = updateFunc;
      };

      var setFindChannelCallback = function (findChannelFunc) {
        self.findChannelCallback = findChannelFunc;
      };

      var setUpdateMessageStatusCallback = function (updateStatusFunc) {
        self.updateMessageStatusCallback = updateStatusFunc;
      };

      var isChannelReady = function (channelId) {
        self.requestedChannelReadyId = channelId;
        self.promissChannelReady = $q.defer();
        if (self.allChannelsReady === true)
          self.promissChannelReady.resolve(true);
        return self.promissChannelReady.promise;
      };

      return {
        sendMessage: sendMessage,
        setCtrlCallback: setCtrlCallback,
        getMessagesFromDb: getMessagesFromDb,
        getLastMessageFromDb: getLastMessageFromDb,
        getNewMessagesFromServer: getNewMessagesFromServer,
        sendSeenNotif: sendSeenNotif,
        setUpdateNotificationCallback: setUpdateNotificationCallback,
        setUpdateLastDatetimeCallback: setUpdateLastDatetimeCallback,
        setFindChannelCallback: setFindChannelCallback,
        setUpdateMessageStatusCallback: setUpdateMessageStatusCallback,
        isChannelReady: isChannelReady,
        getMessageFromDbWithChannelAndId: getMessageFromDbWithChannelAndId,
      };
    }]);
