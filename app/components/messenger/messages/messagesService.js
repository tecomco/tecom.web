'use strict';

app.service('messagesService', ['$q', 'messagesController', 'socket',
  function ($q, messagesController, socket) {

    socket.on('message', function (message) {
      message.datetime = new Date(message.datetime);
      messagesController.pushMessage(message);
    });

    return {
      getMessages: function () {
      },
      sendMessage: function (data, callback) {
        socket.emit('message', data, callback);
      }
    };
  }]);
