'use strict';

app.service('messagesService', ['$q', 'socket', 'Message', '$stateParams',
  function ($q, socket, Message, $stateParams) {

    var ctrlCallbackFunction;

    socket.on('message', function (data) {
      var message = new Message(0, data.body, data.sender, data.channelId);
      if(message.channelId === $stateParams.channel.id)
        ctrlCallbackFunction(message);
    });

    return {
      getMessages: function () {
      },
      sendMessage: function (data, callback) {
        socket.emit('message', data, callback);
      },
      setCallbackFunciton: function (callback) {
        ctrlCallbackFunction = callback;
      }
    };
  }]);
