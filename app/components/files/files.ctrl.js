'use strict';

app.controller('filesController', ['$window', 'filesService', '$scope',
  '$rootScope',
  function ($window, filesService, $scope, $rootScope) {

    $scope.vm = {};

    filesService.updateLiveFile();

    $scope.$on('channels:updated', function (event, data) {
      if (data === 'init') {
        filesService.updateLiveFile();
      }
    });

    $scope.$on('file:lived', function (event, file) {
      $scope.vm.file = file;
    });

    $scope.lineClick = function (lineNum) {
      $scope.vm.file.selectTempLine(lineNum);
    };

  }
]);
