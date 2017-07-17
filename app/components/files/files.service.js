'use strict';

app.service('filesService', [
  '$rootScope', '$http', '$log', 'socket', 'ArrayUtil', '$q', 'channelsService',
  'File', 'FileManagerFile', 'fileUtil',
  function ($rootScope, $http, $log, socket, ArrayUtil, $q, channelsService,
            File, FileManagerFile, fileUtil) {

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
          getFileById(currentChannel.liveFileId)
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

    function getFileById(fileId) {
      var defer = $q.defer();
      var file = ArrayUtil.getElementByKeyValue(self.files, 'id', fileId);
      if (file) {
        defer.resolve(file);
      }
      else {
        $rootScope.$broadcast('file:loading');
        var url;
        var name;
        var type;
        var channelId;
        $http({
          method: 'GET',
          url: '/api/v1/files/' + fileId + '/'
        }).then(function (res) {
          url = res.data.file;
          name = res.data.name;
          type = res.data.type;
          channelId = res.data.channel;
          return getFileDataByUrl(url);
        }).then(function (res) {
          if (fileUtil.isTextFormat(type)) {
            var file = new File(fileId, url, res.data, name, channelId);
            self.files.push(file);
            $rootScope.$broadcast('file:ready');
            defer.resolve(file);
          }
          else {
            $log.error('Lived File Format Not Supported Yet !');
            $rootScope.$broadcast('file:ready');
            defer.reject();
          }
        }).catch(function (err) {
          $log.error('Error Getting File name and URL From Server.', err);
          $rootScope.$broadcast('file:ready');
          defer.reject();
        });
      }
      return defer.promise;
    }

    function getFileManagerFiles(channelId) {
      var files=[];
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/api/v1/files/channels/' + channelId + '/'
      }).then(function (data) {
        data.data.forEach(function (file) {
          var newFile = new FileManagerFile(file.id, file.file, file.name, file.date_uploaded, file.type);
          files.push(newFile);
        });
        deferred.resolve(files);
      }).catch(function (err) {
        $log.info('Error Getting FileManager Files.', err);
        deferred.reject(err);
      });
      return deferred.promise;
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

    function showFileLine(fileId, startLine, endLine) {
      getFileById(fileId).then(function (file) {
        $rootScope.$broadcast('file:show:line', file, startLine, endLine);
      });
    }

    return {
      makeFileLive: makeFileLive,
      killLiveFile: killLiveFile,
      updateLiveFile: updateLiveFile,
      getLivedFile: getLivedFile,
      showFileLine: showFileLine,
      getFileById: getFileById,
      getFileManagerFiles: getFileManagerFiles,
      viewFile: viewFile
    };
  }

])
;
