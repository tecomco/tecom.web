'use strict';

app.controller('filesController', [
  '$window', 'filesService', 'Upload', '$scope', '$timeout', '$rootScope',
  'Team',
  function ($window, filesService, Upload, $scope, $timeout, $rootScope,
    Team) {

    $scope.vm = {};
    var selectTextMode = false;
    var startLine;
    var flagLineIsTemp = false;
    $scope.fileLoading = false;
    $scope.isViewedFileClicked = false;

    var selectedFileType = 'none';
    filesService.updateLiveFile();

    $scope.$on('channel:ready', function (event, data) {
      $scope.channel = data;
    });

    $scope.$on('file:loading', function () {
      $scope.fileLoading = true;
    });

    var self = this;

    $scope.$on('file:ready', function () {
      $scope.fileLoading = false;
    });

    $scope.$on('channels:updated', function (event, data) {
      if (data === 'init') {
        filesService.updateLiveFile();
        $scope.uploadLimit = Team.plan.uploadLimit;
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

    $scope.$on('file:show:line', function (event, file, startLine,
      endLine) {
      if (file === $scope.vm.liveFile) {
        selectedFileType = 'live';
        file.selectPermLines(startLine, endLine);
        scrollToLine(file, startLine, endLine);
      } else if (file === $scope.vm.viewFile) {
        selectedFileType = 'view';
        file.selectPermLines(startLine, endLine);
        scrollToLine(file, startLine, endLine);
      } else {
        selectedFileType = 'view';
        openFile(file);
        file.selectPermLines(startLine, endLine);
        scrollToLine(file, startLine, endLine);
      }
      broadcastViewState();
    });

    $scope.$on('file:upload', function (event, file, errFiles) {
      if (file)
        $rootScope.$broadcast('file:uploading', file);
      if (!file && errFiles[0])
        $rootScope.$broadcast('file:uploadError', 'sizeLimit');
    });

    $scope.showViewedFileClickedWarning = function () {
      if (self.viewClickTimeout) {
        $timeout.cancel(self.viewClickTimeout);
      }
      if (!$scope.viewClickNotif) {
        $scope.viewClickNotif = true;
      }
      self.viewClickTimeout = $timeout(function () {
        $scope.viewClickNotif = false;
      }, 3000);
    };

    $scope.mouseDownLine = function (lineNum) {
      selectTextMode = true;
      if ($scope.vm.liveFile.isLineTemp(lineNum)) {
        flagLineIsTemp = true;
        $scope.vm.liveFile.deselectTempLines();
      }
      startLine = lineNum;
      $scope.vm.liveFile.selectTempLines('start', lineNum);
      $scope.vm.liveFile.selectTempLines('end', lineNum);
    };

    $scope.mouseUpLine = function (lineNum) {
      if (flagLineIsTemp && startLine === lineNum) {
        $scope.vm.liveFile.deselectTempLines();
        flagLineIsTemp = false;
      }
      selectTextMode = false;
      document.getElementById('inputPlaceHolder').focus();
    };

    $scope.mouseOverLine = function (lineNum) {
      if (selectTextMode) {
        var start = Math.min(startLine, lineNum);
        var end = Math.max(startLine, lineNum);
        $scope.vm.liveFile.selectTempLines('start', start);
        $scope.vm.liveFile.selectTempLines('end', end);
      }
    };

    var openFile = function (file) {
      filesService.viewFile(file.id, file.name);
    };

    $scope.closeLiveFile = function () {
      $scope.vm.liveFile.deselectTempLines();
      filesService.killLiveFile($scope.vm.liveFile);
      $scope.vm.liveFile = null;
      broadcastViewState();
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

    $scope.upload = function (file, errFiles) {
      $rootScope.$broadcast('file:upload', file, errFiles);
    };

    $scope.getFileDownloadData = function (type) {
      if ($scope.viewState() === 'live' && $scope.vm.liveFile)
        return (type === 'url') ? $scope.vm.liveFile.url : $scope.vm.liveFile
          .name;
      else if ($scope.viewState() === 'view' && $scope.vm.viewFile)
        return (type === 'url') ? $scope.vm.viewFile.url : $scope.vm.viewFile
          .name;
    };

    function broadcastViewState() {
      $rootScope.$broadcast('view:state:changed', $scope.viewState());
    }

    $scope.makeViewFileLive = function () {
      var file = $scope.vm.viewFile;
      filesService.makeFileLive(file.channelId, file.id, file.name);
    };
    broadcastViewState();

    function scrollToLine(file, start, end) {
      var codeView;
      if ($scope.viewState() === 'live')
        codeView = document.getElementById('liveCodeView');
      else
        codeView = document.getElementById('codeView');
      $timeout(function () {
        var middleLine;
        if (Math.abs(start, end) < 30)
          middleLine = Math.ceil((start + end) / 2);
        else
          middleLine = start;
        var middle = ((middleLine - 17) / file.lines.length) *
          codeView
          .scrollHeight;
        codeView.scrollTop = middle;
      }, 0, false);
    }
  }
]);
