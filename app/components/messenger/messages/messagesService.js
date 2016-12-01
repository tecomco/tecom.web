'use strict';

app.service('messagesService', ['$log', '$q', 'socket', 'Message',
  '$stateParams', 'db',
  function ($log, $q, socket, Message, $stateParams, db) {

    var ctrlPushCallbackFunction;

    socket.on('message:send', function (data) {
      var message = new Message(data.body, data.sender, data.channelId,
        data.status, data.id, null, data.datetime);
      message.setId();
      message.save();
      if (message.channelId === $stateParams.channel.id)
        ctrlPushCallbackFunction(message);
    });

    var getMessages = function (data, callback) {
      socket.emit('message:get', data, callback);
    };

    return {
      getMessages: getMessages,
      sendMessage: function (data, callback) {
        socket.emit('message:send', data, callback);
      },
      setPushCallbackFunction: function (callback) {
        ctrlPushCallbackFunction = callback;
      },
      getUnreadMessagesFromServer: function (channelId) {
        var dataToBeSend = {
          channelId: channelId
        };
        db.getLastChannelMessage(channelId, function (lastMessage) {
          if (lastMessage !== null)
            dataToBeSend.lastSavedMessageId = lastMessage.id;

          getMessages(dataToBeSend, function (err, messages) {
            angular.forEach(messages, function (message) {
              var tmpMessage = new Message(message.body, message.sender, message.channelId,
                Message.STATUS_TYPE.SENT, message.id, null, message.datetime);
              tmpMessage.setId();
              if ($stateParams.channel &&
                tmpMessage.channelId === $stateParams.channel.id)
                ctrlPushCallbackFunction(tmpMessage);
              tmpMessage.save();
            });
          });
        });
      }
    };
  }]);
