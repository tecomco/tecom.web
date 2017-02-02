'use strict';

app.service('filesService', [
  '$rootScope', '$http', '$log', 'socket', 'ArrayUtil', '$q', 'channelsService',
  'File',
  function ($rootScope, $http, $log, socket, ArrayUtil, $q, channelsService,
            File) {

    var self = this;
    self.files = [];

    socket.on('file:lived', function (data) {
      var channel = channelsService.findChannelById(data.channelId);
      channel.liveFileId = data.fileId;
      updateLiveFile();
    });

    function updateLiveFile() {
      var currentChannel = channelsService.getCurrentChannel();
      if (currentChannel) {
        if (currentChannel.liveFileId) {
          getFileById(currentChannel.liveFileId, currentChannel.id)
            .then(function (file) {
              $rootScope.$broadcast('file:lived', file);
              self.livedFile = file;
            });
        }
        else {
          self.livedFile = null;
          $rootScope.$broadcast('file:killed');
        }

      }
    }

    function getFileDataByUrl(fileUrl) {
      return $http({
        method: 'GET',
        url: fileUrl
      });
    }

    function getFileById(fileId, channelId) {
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
          var file = new File(fileId, url, res.data, name, channelId);
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
      sendLiveFileDataToServer('makeLive', channelId, fileName, fileId);
    }

    function killLiveFile(file) {
      sendLiveFileDataToServer('kill', file.channelId, file.name);
    }

    function sendLiveFileDataToServer(type, channelId, fileName, fileId) {
      var data = {
        channelId: channelId,
        fileName: fileName
      };
      if (type === 'makeLive')
        data.fileId = fileId;
      else if (type === 'kill')
        data.fileId = null;

      socket.emit('file:lived', data);
    }

    function getLivedFile() {
      return self.livedFile;
    }

    function showFileLine(fileId, lineNumber) {
      getFileById(fileId).then(function (file) {
        $rootScope.$broadcast('file:show:line', file, lineNumber);
      });
    }

    return {
      makeFileLive: makeFileLive,
      killLiveFile: killLiveFile,
      updateLiveFile: updateLiveFile,
      getLivedFile: getLivedFile,
      showFileLine: showFileLine
    };
  }

])
;
