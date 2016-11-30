'use strict';

app.service('messagesService', ['$q', 'socket', 'Message', '$stateParams', 'db',
  function ($q, socket, Message, $stateParams, db) {

    var ctrlCallbackFunction;

    socket.on('message:send', function (data) {
      var message = new Message(data.body, data.sender, data.channelId,
        data.status, data.id, null, data.datetime);
      message.setId();
      message.save();
      if(message.channelId === $stateParams.channel.id)
        ctrlCallbackFunction(message);
    });

    return {
      getMessages: function () {
      },
      sendMessage: function (data, callback) {
        socket.emit('message:send', data, callback);
      },
      setCallbackFunciton: function (callback) {
        ctrlCallbackFunction = callback;
      }
    };
  }]);
