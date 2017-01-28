'use strict';

app.service('FilesService', [
  '$rootScope', 'socket', 'ArrayUtil',
  function ($rootScope, socket, ArrayUtil) {

    var self;

    self.files = [];

    socket.on('file:lived', function (data) {
      var fileUrl = getUrlById(data.fileId);
    });

    function getUrlById(fileId) {
      var file = ArrayUtil.getElementByKeyValue(self.files, 'id', fileId);
      if (file) {

      }
    }

  }
]);
