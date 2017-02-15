'use strict';

app.controller('filesController', ['$window', 'filesService', '$scope',
  '$timeout', '$rootScope',
  function ($window, filesService, $scope, $timeout, $rootScope) {

    $scope.vm = {};
    var selectedFileType = 'none';
    filesService.updateLiveFile();


    $scope.$on('channels:updated', function (event, data) {
      if (data === 'init') {
        filesService.updateLiveFile();
      }
    });

    $scope.$on('file:lived', function (event, file) {
      selectedFileType = 'live';
      if ($scope.vm.viewFile && file.id === $scope.vm.viewFile.id)
        $scope.vm.viewFile = null;
      $scope.vm.liveFile = file;
      broadcastViewState();
    });

    $scope.$on('file:killed', function () {
      selectedFileType = 'view';
      $scope.vm.liveFile = null;
      broadcastViewState();
    });

    $scope.$on('file:view', function (event, file) {
      selectedFileType = 'view';
      $scope.vm.viewFile = file;
      broadcastViewState();
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
      broadcastViewState();
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
      selectedFileType = 'live';
      $scope.vm.viewFile = null;
      broadcastViewState();
    };

    $scope.liveFileTabClick = function () {
      selectedFileType = 'live';
      broadcastViewState();
    };

    $scope.viewFileTabClick = function () {
      selectedFileType = 'view';
      broadcastViewState();
    };

    $scope.viewState = function () {
      if (!($scope.vm.liveFile || $scope.vm.viewFile))
        return 'noFile';
      else if (selectedFileType === 'live')
        return 'live';
      else
        return 'view';
    };

    function broadcastViewState() {
      $rootScope.$broadcast('view:state:changed', $scope.viewState());
    }

    broadcastViewState();

    function scrollToLine(file, lineNum) {
      var codeView;
      if ($scope.viewState() === 'live')
        codeView = document.getElementById('liveCodeView');
      else
        codeView = document.getElementById('codeView');
      $timeout(function () {
        var middle = ((lineNum - 17) / file.lines.length) * codeView.scrollHeight;
        codeView.scrollTop = middle;
      }, 0, false);
    }
  }
]);
