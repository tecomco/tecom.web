'use strict';

app.controller('filesController', ['$window', 'filesService', '$scope',
  '$timeout',
  function ($window, filesService, $scope, $timeout) {

    $scope.vm = {};
    var selectedFileType = 'none';
    filesService.updateLiveFile();


    $scope.$on('channels:updated', function (event, data) {
      if (data === 'init') {
        filesService.updateLiveFile();
      }
    });

    $scope.$on('file:lived', function (event, file) {
      $scope.vm.liveFile = file;
      selectedFileType = 'live';
    });

    $scope.$on('file:killed', function (event) {
      $scope.vm.liveFile = null;
    });

    $scope.$on('file:view', function (event, file) {
      $scope.vm.viewFile = file;
      selectedFileType = 'view';
    });

    $scope.$on('file:show:line', function (event, file, lineNumber) {
      if (file === $scope.vm.liveFile) {
        selectedFileType = 'live';
        file.selectPermLine(lineNumber);
        scrollToLine(file, lineNumber);
      }
      else if (file === $scope.vm.viewFile) {
        selectedFileType = 'view';
        file.selectPermLine(lineNumber);
        scrollToLine(file, lineNumber);
      }
      else {
        selectedFileType = 'view';
        openFile(file);
        file.selectPermLine(lineNumber);
        scrollToLine(file, lineNumber);
      }
    });

    $scope.lineClick = function (lineNum) {
      $scope.vm.liveFile.selectTempLine(lineNum);
      document.getElementById('inputPlaceHolder').focus();
    };

    var openFile = function (file) {
      filesService.viewFile(file.id, file.name);
    };

    $scope.closeLiveFile = function (file) {
      filesService.killLiveFile(file);
    };

    $scope.closeViewFile = function () {
      $scope.vm.viewFile = null;
    };

    $scope.liveFileTabClick = function(){
      selectedFileType = 'live';
    }

    $scope.viewFileTabClick = function(){
      selectedFileType = 'view';
    }

    $scope.viewState = function () {
      if (!($scope.vm.liveFile || $scope.vm.viewFile))
        return 'noFile';
      else if (selectedFileType === 'live')
        return 'live';
      else
        return 'view';
    };

    function scrollToLine(file, lineNum) {
      $timeout(function () {
        var codeView = document.getElementById('codeView');
        var middle = ((lineNum - 17) / file.lines.length) * codeView.scrollHeight;
        codeView.scrollTop = middle;
      }, 0, false);
    }
  }
]);
