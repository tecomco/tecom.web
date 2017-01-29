'use strict';

app.controller('filesController', [
  '$window', 'filesService', '$scope',
  function ($window, filesService, $scope) {

    $scope.file = {};

    filesService.updateLiveFile();

    $scope.$on('channels:updated', function (event, data) {
      if (data === 'init') {
        filesService.updateLiveFile();
      }
    });

    $scope.$on('file:lived', function (event, fileData) {
      $scope.file.data = $window.PR.prettyPrintOne(fileData, '', true);
    });

  }]);
