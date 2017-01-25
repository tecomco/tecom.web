'use strict';

app.service('FilesService', [
  '$rootScope', 'socket',
  function ($rootScope, socket) {

    socket.on('file:lived', function (data) {

    });

  }
]);
