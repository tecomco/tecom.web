'use strict';

app.service('filesService', [
  '$rootScope', '$http', '$log', 'socket', 'ArrayUtil', '$q', 'channelsService',
  'File', 'fileUtil',
  function ($rootScope, $http, $log, socket, ArrayUtil, $q, channelsService,
            File, fileUtil) {

    var self = this;
    self.files = [];
    self.viewFile = null;

    socket.on('file:lived', function (data) {
      channelsService.setChannelLivedFileId(data.channelId, data.fileId);
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
        var type;
        $http({
          method: 'GET',
          url: '/api/v1/files/' + fileId + '/'
        }).then(function (res) {
          url = res.data.file;
          name = res.data.name;
          type = res.data.type;
          return getFileDataByUrl(url);
        }).then(function (res) {
          if (fileUtil.isTextFormat(type)) {
            var file = new File(fileId, url, res.data, name, channelId);
            self.files.push(file);
            defer.resolve(file);
          }
          else
            $log.error('Lived File Format Not Supported Yet !');
          defer.reject();
        }).catch(function (err) {
          $log.error('Error Getting File name and URL From Server.', err);
          defer.reject();
        });
      }
      return defer.promise;
    }

    function viewFile(fileId) {
      if (self.livedFile && self.livedFile.id === fileId) {
        updateLiveFile();
      }
      else {
        getFileById(fileId).then(function (file) {
          $rootScope.$broadcast('file:view', file);
        });
      }
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
      showFileLine: showFileLine,
      getFileById: getFileById,
      viewFile: viewFile
    };
  }

])
;
