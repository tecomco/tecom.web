'use strict';

app.service('messagesService',
  ['$log', '$q', 'socket', 'Message', '$stateParams', 'db',
    function ($log, $q, socket, Message, $stateParams, db) {

      var self = this;

      socket.on('message:send', function (data) {
        var message = new Message(data.body, data.senderId, data.channelId,
          data.status, data.id, data.datetime);
        message.save();
        if (message.channelId === $stateParams.channel.id) {
          self.ctrlCallback(message);
          sendSeenNotif(message.channelId, message.id, message.senderId);
        }
        else {
          self.updateNotification(message.channelId, 'inc');
          self.updateLastDatetimeCallback(message.channelId, message.datetime);
        }
      });

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
                channel.lastDatetime = new Date(res.lastDatetime);
                var channelMessagesData = res.messages;
                channelMessagesData.forEach(function (msg) {
                  var message = new Message(msg.body, msg.senderId, msg.channelId,
                    Message.STATUS_TYPE.SENT, msg.id, msg.datetime);
                  // if ($stateParams.channel &&
                  //   message.channelId === $stateParams.channel.id)
                  //self.ctrlCallback(message);
                  allMessages.push(message);
                });
                resolve();
              });
            });
          }));
        });
        Promise.all(messagePromises).then(function () {
          Message.bulkSave(allMessages);
        });
      }

      var sendSeenNotif = function (channelId, lastMessageId, senderId, callback) {
        var data = {
          channelId: channelId,
          messageId: lastMessageId,
          senderId: senderId
        };
        $log.info('Seen');
        socket.emit('message:seen', data, callback);
      };

      var setUpdateNotificationCallback = function (updateFunc) {
        self.updateNotification = updateFunc;
      };

      var setUpdateLastDatetimeCallback = function (updateFunc) {
        self.updateLastDatetimeCallback = updateFunc;
      };

      return {
        sendMessage: sendMessage,
        setCtrlCallback: setCtrlCallback,
        getMessagesFromDb: getMessagesFromDb,
        getLastMessageFromDb: getLastMessageFromDb,
        getNewMessagesFromServer: getNewMessagesFromServer,
        sendSeenNotif: sendSeenNotif,
        setUpdateNotificationCallback: setUpdateNotificationCallback,
        setUpdateLastDatetimeCallback: setUpdateLastDatetimeCallback
      };
    }]);
