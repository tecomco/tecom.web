'use strict';

app.service('filesService', [
  '$rootScope', '$http', '$log', 'socket', 'ArrayUtil', '$q', 'channelsService',
  function ($rootScope, $http, $log, socket, ArrayUtil, $q, channelsService) {

    var self = this;

    self.files = [];

    socket.on('file:lived', function (data) {
      getFileDataById(data.fileId).then(function (fileData) {
        $rootScope.$broadcast('file:lived', fileData);
      });
    });

    function updateLiveFile() {
      var currentChannel = channelsService.getCurrentChannel();
      if (currentChannel && currentChannel.liveFileId) {
        getFileDataById(currentChannel.liveFileId).then(function (fileData) {
          $rootScope.$broadcast('file:lived', fileData);
        });
      }
    }

    function getFileDataById(fileId) {
      var defer = $q.defer();
      getUrlById(fileId).then(function (url) {
        getFileDataByUrl(url).success(function (fileData) {
          defer.resolve(fileData);
        }).error(function (err) {
          $log.error('Error Getting File From Server.', err);
          defer.reject();
        });
      });
      return defer.promise;
    }

    function getFileDataByUrl(fileUrl) {
      return $http({
        method: 'GET',
        url: fileUrl
      });
    }

    function getUrlById(fileId) {
      var defer = $q.defer();
      var file = ArrayUtil.getElementByKeyValue(self.files, 'id', fileId);
      if (file) {
        defer.resolve(file.url);
      }
      $http({
        method: 'GET',
        url: '/api/v1/files/' + fileId + '/url'
      }).success(function (res) {
        var file = {id: fileId, url: res.file};
        self.files.push(file);
        defer.resolve(file.url);
      }).error(function (err) {
        console.log('Error Getting File From Server.', err);
        defer.reject();
      });
      return defer.promise;
    }

    function makeFileLive(channelId, fileId) {
      var data = {
        channelId: channelId,
        fileId: fileId
      };
      socket.emit('file:lived', data);
    }

    return {
      makeFileLive: makeFileLive,
      getUrlById: getUrlById,
      getFileDataByUrl: getFileDataByUrl,
      getFileDataById: getFileDataById,
      updateLiveFile: updateLiveFile
    };
  }
]);
