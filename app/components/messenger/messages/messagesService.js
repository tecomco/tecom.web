'use strict';

app.service('messagesService',
  ['$rootScope', '$log', '$q', 'socket', 'channelsService', 'Message', 'db', 'User',
  function ($rootScope, $log, $q, socket, channelsService, Message, db, User) {

    var self = this;

    socket.on('message:send', function (data) {
      var message = new Message(data.body, data.type, data.senderId,
        data.channelId, data.id, data.datetime, data.additionalData);
      message.save();
      $rootScope.$broadcast('message', message);
      channelsService.updateChannelLastDatetime(message.channelId,
        message.datetime);
    });

    socket.on('message:type:start', function (data) {
      channelsService.addIsTypingMemberByChannelId(data.channelId,
        data.memberId);
    });

    socket.on('message:type:end', function (data) {
      channelsService.removeIsTypingMemberByChannelId(data.channelId,
        data.memberId);
    });

    /**
     * @todo Find out what's the purpose of the commented part?
     */
    socket.on('message:seen', function (data) {
      console.log('on seen');
      channelsService.updateChannelLastSeen(data.channelId, data.messageId);
      // if ($stateParams.channel.id && $stateParams.channel.id === data.channelId)
      //   self.updateMessageStatusCallback(data.messageId, Message.STATUS_TYPE.SEEN);
    });

    $rootScope.$on('channel:new', function (event, channel) {
      getAndSaveNewMessagesByChannelFromServer(channel);
    });

    function getAndSaveNewMessagesByChannelFromServer(channel) {
      var messagePromises = [];
      var messages = [];
      var dataToBeSend = {
        channelId: channel.id
      };
      messagePromises.push(new Promise(function (resolve) {
        getLastMessageByChannelIdFromDb(channel.id)
          .then(function (lastMessage) {
            if (lastMessage) {
              dataToBeSend.lastSavedMessageId = lastMessage.id;
            }
            socket.emit('message:get', dataToBeSend, function (res) {
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
                  msg.channelId, msg.id, msg.datetime, msg.additionalData);
                messages.push(message.getDbWellFormed());
              });
              resolve();
            });
          });
      }));
      Promise.all(messagePromises).then(function () {
        bulkSaveMessage(messages);
      });
    }

    function bulkSaveMessage(messages) {
      db.getDb().bulkDocs(messages)
        .catch(function (err) {
          $log.error('Bulk saving messages failed.', err);
        });
    }

    function getMessagesByChannelId(channelId) {
      var deferred = $q.defer();
      getMessagesByChannelIdFromDb(channelId)
        .then(function (res) {
          var messages = [];
          res.docs.forEach(function (doc) {
            var message = new Message(doc.body, doc.type, doc.senderId,
              doc.channelId, doc._id, doc.datetime, doc.additionalData);
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
      return db.getDb().find({
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
      });
    }

    function getLastMessageByChannelIdFromDb(channelId) {
      var deferred = $q.defer();
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
          deferred.resolve(null);
        } else {
          deferred.resolve(result.docs[0]);
        }
      }).catch(function (err) {
        $log.error('Getting last message from db failed.', err);
        deferred.reject();
      });
      return deferred.promise;
    }

    function sendAndGetMessage(channelId, messageBody) {
      var message = new Message(messageBody, Message.TYPE.TEXT, User.id,
        channelId, null, null, null, true);
      socket.emit('message:send', message.getServerWellFormed(),
        function (data) {
          message.status = Message.STATUS_TYPE.SENT;
          message.setIdAndDatetime(data.id, data.datetime);
          message.save();
          channelsService.updateChannelLastDatetime(message.channelId,
            message.datetime);
        });
      return message;
    }

    function seenMessage(channelId, messageId, senderId) {
      console.log('emit seen');
      var data = {
        channelId: channelId,
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

    return {
      getMessagesByChannelId: getMessagesByChannelId,
      sendAndGetMessage: sendAndGetMessage,
      seenMessage: seenMessage,
      seenLastMessageByChannelId: seenLastMessageByChannelId,
      startTyping: startTyping,
      endTyping: endTyping
    };
  }
]);

app.run(['messagesService', function (messagesService) {}]);
