'use strict';

app.controller('fileManagerController', [
  '$scope', 'filesService', 'channelsService', 'FileManagerFile', '$stateParams', '$q',
  function ($scope, filesService, channelsService, FileManagerFile, $stateParams, $q) {

    $scope.files = [];
    $scope.fileManagerFilter = null;
    var fileManagerStatus = 'closed';
    var initializeFileManager = true;

    $scope.$on('channel:changed', function () {
      $scope.channel = channelsService.getCurrentChannel();
    });

    $scope.getFileManagerClass = function () {
      if (fileManagerStatus === 'closed')
        return 'mime-holder closed';
      else
        return 'mime-holder opened';
    };

    $scope.toggleFileManagerStatus = function () {
      if (initializeFileManager) {
        filesService.getFileManagerFiles($scope.channel.id).then(function (files) {
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

    $scope.channelHasAnyFile = function () {
      if ($scope.files.length !== 0)
        return true;
      return false;
    };

    $scope.fileManagerFileFilter = function (file) {
      if (!$scope.fileManagerFilter)
        return true;
      return $scope.fileManagerFilter === file.type;
    };

    $scope.changeFileManagerFilter = function (type) {
      if (type === '0')
        $scope.fileManagerFilter = null;
      else if (type === '1')
        $scope.fileManagerFilter = FileManagerFile.TYPE.CODE;
      else if (type === '2')
        $scope.fileManagerFilter = FileManagerFile.TYPE.PICTURE;
      else if (type === '3')
        $scope.fileManagerFilter = FileManagerFile.TYPE.DOCUMENT;
      else if (type === '4')
        $scope.fileManagerFilter = FileManagerFile.TYPE.OTHER;
    };

    $scope.goLive = function (fileId, fileName) {
      filesService.makeFileLive($scope.channel.id, fileId, fileName);
    };

    $scope.viewFile = function (fileId) {
      filesService.viewFile(fileId);
    };

    function setCurrentChannel() {
      var defer = $q.defer();
      var slug = $stateParams.slug.replace('@', '');
      channelsService.setCurrentChannelBySlug(slug).then(function () {
        $scope.channel = channelsService.getCurrentChannel();
        defer.resolve();
      });
      return defer.promise;
    }

  }
]);
