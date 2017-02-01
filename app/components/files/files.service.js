'use strict';

app.service('filesService', [
  '$rootScope', '$http', '$log', 'socket', 'ArrayUtil', '$q', 'channelsService',
  'File',
  function ($rootScope, $http, $log, socket, ArrayUtil, $q, channelsService,
            File) {

    var self = this;
    self.files = [];

    socket.on('file:lived', function (data) {
      getFileById(data.fileId)
        .then(function (file) {
          $rootScope.$broadcast('file:lived', file);
          self.livedFile = file;
        });
    });

    function updateLiveFile() {
      var currentChannel = channelsService.getCurrentChannel();
      if (currentChannel && currentChannel.liveFileId) {
        getFileById(currentChannel.liveFileId)
          .then(function (file) {
            $rootScope.$broadcast('file:lived', file);
            self.livedFile = file;
          });
      }
    }

    function getFileDataByUrl(fileUrl) {
      return $http({
        method: 'GET',
        url: fileUrl
      });
    }

    function getFileById(fileId) {
      var defer = $q.defer();
      var file = ArrayUtil.getElementByKeyValue(self.files, 'id', fileId);
      if (file) {
        defer.resolve(file);
      }
      else {
        var url;
        var name;
        $http({
          method: 'GET',
          url: '/api/v1/files/' + fileId + '/url-name'
        }).then(function (res) {
          url = res.data.file;
          name = res.data.name;
          return getFileDataByUrl(url);
        }).then(function (res) {
          var file = new File(fileId, url, res.data, name);
          self.files.push(file);
          defer.resolve(file);
        }).catch(function (err) {
          console.log('Error Getting File From Server.', err);
          defer.reject();
        });
      }
      return defer.promise;
    }

    function makeFileLive(channelId, fileId, fileName) {
      var data = {
        channelId: channelId,
        fileId: fileId,
        fileName: fileName
      };
      socket.emit('file:lived', data);
    }

    function getLivedFile(){
      return self.livedFile;
    }

    function showFileLine(fileId, lineNumber){
      getFileById(fileId).then(function(file){
        file.selectPermLine(lineNumber);
      });
    }

    return {
      makeFileLive: makeFileLive,
      updateLiveFile: updateLiveFile,
      getLivedFile: getLivedFile,
      showFileLine: showFileLine
    };
  }
]);
