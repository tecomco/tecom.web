'use strict';

app.controller('fileManagerController', [
  '$scope', 'filesService', 'channelsService', 'FileManagerFile',
  '$stateParams', '$q',
  function ($scope, filesService, channelsService, FileManagerFile,
    $stateParams, $q) {

    $scope.files = [];
    $scope.fileManagerFilterType = null;
    var fileManagerStatus = 'closed';
    var initializeFileManager = true;

    $scope.$on('channel:changed', function () {
      $scope.channel = channelsService.getCurrentChannel();
    });

    $scope.$on('file:newFileManagerFile', function (event, file) {
      $scope.files.push(file);
    });

    $scope.getFileManagerClass = function () {
      if (fileManagerStatus === 'closed')
        return 'mime-holder closed';
      else
        return 'mime-holder opened';
    };

    $scope.toggleFileManagerStatus = function () {
      if (initializeFileManager) {
        filesService.getFileManagerFiles($scope.channel.id).then(function (
          files) {
          $scope.files = files;
          initializeFileManager = false;
          fileManagerStatus = 'opened';
        });
      } else {
        if (fileManagerStatus === 'closed')
          fileManagerStatus = 'opened';
        else
          fileManagerStatus = 'closed';
      }
    };

    $scope.doesChannelHaveAnyFilteredFiles = function () {
      if ($scope.fileManagerFilterType === null) {
        if ($scope.files.length !== 0)
          return true;
        return false;
      } else {
        var filteredFiles = $scope.files.filter(function (file) {
          return file.type === $scope.fileManagerFilterType;
        });
        if (filteredFiles.length !== 0)
          return true;
        return false;
      }
    };

    $scope.fileManagerFilesFilter = function (file) {
      if (!$scope.fileManagerFilterType)
        return true;
      return $scope.fileManagerFilterType === file.type;
    };

    $scope.getMessageOfNoFilteredFile = function () {
      if ($scope.fileManagerFilterType === null)
        return 'هیچ فایلی وجود ندارد';
      else if ($scope.fileManagerFilterType === FileManagerFile.TYPE.CODE)
        return 'هیچ فایلی به صورت کد وحود ندارد';
      else if ($scope.fileManagerFilterType === FileManagerFile.TYPE.PICTURE)
        return 'هیچ عکسی وجود ندارد';
      else if ($scope.fileManagerFilterType === FileManagerFile.TYPE.DOCUMENT)
        return 'هیچ سندی وجود ندارد';
      else if ($scope.fileManagerFilterType === FileManagerFile.TYPE.OTHER)
        return 'هیچ فایل دیگری وحود ندارد';
    };

    $scope.changeFileManagerFilterType = function (type) {
      if (type === '0')
        $scope.fileManagerFilterType = null;
      else if (type === '1')
        $scope.fileManagerFilterType = FileManagerFile.TYPE.CODE;
      else if (type === '2')
        $scope.fileManagerFilterType = FileManagerFile.TYPE.PICTURE;
      else if (type === '3')
        $scope.fileManagerFilterType = FileManagerFile.TYPE.DOCUMENT;
      else if (type === '4')
        $scope.fileManagerFilterType = FileManagerFile.TYPE.OTHER;
    };

    $scope.goLive = function (fileId, fileName) {
      filesService.makeFileLive($scope.channel.id, fileId, fileName);
    };

    $scope.viewFile = function (fileId) {
      filesService.viewFile(fileId);
    };

  }
]);
