'use strict';

app.service('messagesService', ['$q', 'socket', function ($q, socket) {

    socket.on('message', function (message) {
      // message.datetime = new Date(message.datetime);
      // messagesController.pushMessage(message);
    });

    return {
      getMessages: function () {
      },
      sendMessage: function (data, callback) {
        socket.emit('message', data, callback);
      }
    };
  }]);
