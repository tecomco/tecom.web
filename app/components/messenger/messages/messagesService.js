'use strict';

app.service('messagesService', ['$q' , 'socket', function ($q, socket) {
  return {
    getMessages: function () {
    },
    sendMessage: function (data, callback) {
      socket.emit('message', data, callback);
    }
  };
}]);
