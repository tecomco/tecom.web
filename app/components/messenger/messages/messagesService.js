'use strict';

app.service('messagesService',
  ['$log', 'socket', 'Message', '$stateParams', 'db',
  function ($log, socket, Message, $stateParams, db) {

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

    function getLastMessageFromDb(channelId, callback) {
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
        if (result.docs.length === 0)
          callback(null);
        else
          callback(result.docs[0]);
      });
    }

    function getNewMessagesFromServer(channel) {
      var dataToBeSend = {
        channelId: channel.id
      };
      getLastMessageFromDb(channel.id, function (lastMessage) {
        if (lastMessage !== null)
          dataToBeSend.lastSavedMessageId = lastMessage.id;
        socket.emit('message:get', dataToBeSend, function (err, res) {
          if (!err) {
            $log.info("res:" ,res);
            channel.setSeenStatus(res.channelLastSeen, res.userLastSeen);
            var messages = res.messages;
            messages.forEach(function (msg) {
              var message = new Message(msg.body, msg.senderId, msg.channelId,
                Message.STATUS_TYPE.SENT, msg.id, msg.datetime);
              if ($stateParams.channel &&
                message.channelId === $stateParams.channel.id)
                self.ctrlCallback(message);
              message.save();
            });
          } else {
            $log.error('Get messages from server error.', err);
          }
        });
      });
    }

    function sendSeenNotif(channelId, lastMessageId, callback) {
      var data = {
        channelId: channelId,
        lastMessageId: lastMessageId
      };
      socket.emit('message:seen', data, callback);
    }

    return {
      sendMessage: sendMessage,
      setCtrlCallback: setCtrlCallback,
      getMessagesFromDb: getMessagesFromDb,
      getNewMessagesFromServer: getNewMessagesFromServer,
      sendSeenNotif: sendSeenNotif
    };
  }
]);
