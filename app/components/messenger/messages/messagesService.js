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
        var allMessages = [];
        channels.forEach(function (channel) {
          var dataToBeSend = {
            channelId: channel.id
          };
          getLastMessageFromDb(channel.id).then(function (lastMessage) {
            if (lastMessage !== null)
              dataToBeSend.lastSavedMessageId = lastMessage.id;
            socket.emit('message:get', dataToBeSend, function (res) {
              channel.updateNotif(res.notifCount);
              var channelMessages = res.messages;
              channelMessages.forEach(function (msg) {
                var message = new Message(msg.body, msg.senderId, msg.channelId,
                  Message.STATUS_TYPE.SENT, msg.id, msg.datetime);
                if ($stateParams.channel &&
                  message.channelId === $stateParams.channel.id)
                  self.ctrlCallback(message);
                allMessages.push(message);
              });
            });
          });
        });
        allMessages.forEach(function (message) {
          message.save();
        });
      }

      function sendSeenNotif(channelId, lastMessageId, senderId) {
        var data = {
          channelId: channelId,
          lastMessageId: lastMessageId,
          senderId: senderId
        };
        socket.emit('message:seen', data);
      }

      return {
        sendMessage: sendMessage,
        setCtrlCallback: setCtrlCallback,
        getMessagesFromDb: getMessagesFromDb,
        getLastMessageFromDb: getLastMessageFromDb,
        getNewMessagesFromServer: getNewMessagesFromServer,
        sendSeenNotif: sendSeenNotif
      };
    }]);
