'use strict';

app.controller('fileManagerController', [
  '$scope', '$rootScope', 'filesService', 'channelsService',
  'FileManagerFile', '$state',
  function ($scope, $rootScope, filesService, channelsService,
    FileManagerFile, $state) {

    $scope.files = [];
    $scope.fileManagerFilterType = null;
    var isLoading = false;
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
        isLoading = true;
        filesService.getFileManagerFiles($scope.channel.id)
          .then(function (files) {
            $scope.files = files;
            isFileManagerInitialized = false;
            isLoading = false;
            isFileManagerClosed = false;
          });
      } else {
        if (isFileManagerClosed)
          isFileManagerClosed = false;
        else
          isFileManagerClosed = true;
      }
    };

    $scope.getFileManagerToggleClass = function () {
      if (isLoading)
        return 'fa fa-spinner fa-spin';
      else
        return 'mime-menu-toggle';
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
        case FileManagerFile.TYPE.CODE:
          return 'کدی وجود ندارد.';
        case FileManagerFile.TYPE.PICTURE:
          return 'عکسی وجود ندارد.';
        case FileManagerFile.TYPE.DOCUMENT:
          return 'سندی وجود ندارد.';
        case FileManagerFile.TYPE.OTHER:
          return 'فایل دیگری وجود ندارد.';
        default:
          return 'فایلی وجود ندارد.';
      }
    };

    $scope.goLive = function (fileId, fileName) {
      filesService.makeFileLive($scope.channel.id, fileId, fileName);
    };

    $scope.viewFile = function (fileId) {
      filesService.viewFile(fileId);
    };

    $scope.fullscreenImage = function (url, name) {
      $rootScope.$broadcast('image:fullscreen', url, name);
    };

    $scope.navigateToHome = function () {
      $state.go('messenger.home');
    };
  }
]);
