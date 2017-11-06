'use strict';

app.controller('fileManagerController', [
  '$scope', '$rootScope', 'filesService', 'channelsService',
  'FileManagerFile', '$state',
  function ($scope, $rootScope, filesService, channelsService,
    FileManagerFile, $state) {

    $scope.files = [];
    $scope.fileManagerFilterType = null;
    $scope.isFileManagerInitialized = false;
    $scope.channel = channelsService.getCurrentChannel();
    var isLoading = false;
    var isFileManagerClosed = true;

    $scope.$on('channel:changed', function () {
      $scope.channel = channelsService.getCurrentChannel();
    });

    $scope.$on('file:newFileManagerFile', function (event, file) {
      $scope.files.push(file);
    });

    $scope.$on('toolbar:initialize:fileManager', function (event, file) {
      filesService.getFileManagerFiles($scope.channel.id)
        .then(function (files) {
          $scope.files = files;
          $scope.isFileManagerInitialized = true;
        });
    });

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
      $rootScope.$broadcast('toolbar:activate:live');
    };

    $scope.viewFile = function (fileId) {
      $rootScope.$broadcast('toolbar:activate:live');
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
