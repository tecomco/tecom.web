'use strict';

app.controller('filesController', ['filesService', '$scope', 'channelsService',
  function (filesService, $scope, channelsService) {

    $scope.file = {};

    if (channelsService) {
      var currentChannel = channelsService.getCurrentChannel();
      if (currentChannel.liveFileId) {
        filesService.getFileDataById(currentChannel.liveFileId).then(function (fileData) {
          $scope.file.data = fileData;
        });
      }
    }
    $scope.$on('file:lived', function (event, fileData) {
      $scope.file.data = fileData;
    });

  }]);
