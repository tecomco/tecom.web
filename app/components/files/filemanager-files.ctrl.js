'use strict';

app.controller('fileManagerController', [
  '$scope', 'filesService', 'channelsService', 'FileManagerFile',
  function ($scope, filesService, channelsService, FileManagerFile) {

    $scope.files = [];
    $scope.fileManagerFilterType = null;
    $scope.fileManagerToggleClass = 'mime-menu-toggle';
    var isFileManagerClosed = true;
    var isFileManagerInitialized = true;

    $scope.$on('channel:changed', function () {
      $scope.channel = channelsService.getCurrentChannel();
    });

    $scope.$on('file:newFileManagerFile', function (event, file) {
      $scope.files.push(file);
    });

    $scope.getFileManagerClass = function () {
      if (isFileManagerClosed)
        return 'mime-holder closed';
      else
        return 'mime-holder opened';
    };

    $scope.toggleFileManagerStatus = function () {
      if (isFileManagerInitialized) {
        $scope.fileManagerToggleClass = 'fa fa-spinner';
        filesService.getFileManagerFiles($scope.channel.id).then(function (
          files) {
          $scope.files = files;
          $scope.fileManagerToggleClass = 'mime-menu-toggle';
          isFileManagerInitialized = false;
          isFileManagerClosed = false;
        });
      } else {
        if (isFileManagerClosed)
          isFileManagerClosed = false;
        else
          isFileManagerClosed = true;
      }
    };

    $scope.doesChannelHaveAnyFilteredFiles = function () {
      if ($scope.fileManagerFilterType === null) {
        return ($scope.files.length !== 0);
      } else {
        var filteredFiles = $scope.files.filter(function (file) {
          return file.type === $scope.fileManagerFilterType;
        });
        return filteredFiles.length !== 0;
      }
    };

    $scope.shouldShowInFileManager = function (file) {
      if (!$scope.fileManagerFilterType)
        return true;
      return $scope.fileManagerFilterType === file.type;
    };

    $scope.getMessageOfNoFilteredFile = function () {
      switch (parseInt($scope.fileManagerFilterType)) {
        case null:
          return 'هیچ فایلی وجود ندارد';
        case FileManagerFile.TYPE.CODE:
          return 'هیچ فایلی به صورت کد وحود ندارد';
        case FileManagerFile.TYPE.PICTURE:
          return 'هیچ عکسی وجود ندارد';
        case FileManagerFile.TYPE.DOCUMENT:
          return 'هیچ سندی وجود ندارد';
        case FileManagerFile.TYPE.OTHER:
          return 'هیچ فایل دیگری وحود ندارد';
      }
    };

    $scope.goLive = function (fileId, fileName) {
      filesService.makeFileLive($scope.channel.id, fileId, fileName);
    };

    $scope.viewFile = function (fileId) {
      filesService.viewFile(fileId);
    };

  }
]);
