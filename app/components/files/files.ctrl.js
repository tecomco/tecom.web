'use strict';

app.controller('filesController', ['$window', 'filesService', '$scope',
  '$timeout',
  function ($window, filesService, $scope, $timeout) {

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

    $scope.$on('file:killed', function (event) {
      $scope.vm.file = null;
    });

    $scope.$on('file:show:line', function(event, file, lineNumber){
      file.selectPermLine(lineNumber);
      scrollToLine(file, lineNumber);
    });

    $scope.lineClick = function (lineNum) {
      $scope.vm.file.selectTempLine(lineNum);
      document.getElementById('inputPlaceHolder').focus();
    };

    $scope.closeFile = function (file) {
      filesService.killLiveFile(file);
    };

    function scrollToLine(file, lineNum) {
      $timeout(function () {
        var codeView = document.getElementById('codeView');
        var middle = ((lineNum-17)/file.lines.length) * codeView.scrollHeight;
        codeView.scrollTop = middle;
      }, 0, false);
    }


  }
]);
