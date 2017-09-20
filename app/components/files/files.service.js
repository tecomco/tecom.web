'use strict';

app.service('filesService', [
  '$rootScope', '$http', '$log', 'socket', 'ArrayUtil', '$q', 'Team',
  'channelsService', 'File', 'FileManagerFile', 'fileUtil', 'Upload',
  function ($rootScope, $http, $log, socket, ArrayUtil, $q, Team,
    channelsService, File, FileManagerFile, fileUtil, Upload) {

    var self = this;
    var uploadQueue = [];
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
        } else {
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
      } else {
        $rootScope.$broadcast('file:loading');
        var url;
        var name;
        var type;
        var channelId;
        $http({
            method: 'GET',
            url: '/api/v1/files/' + fileId + '/'
          })
          .then(function (res) {
            url = res.data.file;
            name = res.data.name;
            type = res.data.type;
            channelId = res.data.channel;
            return getFileDataByUrl(url);
          })
          .then(function (res) {
            if (fileUtil.isTextFormat(type)) {
              var file = new File(fileId, url, res.data, name, channelId);
              self.files.push(file);
              $rootScope.$broadcast('file:ready');
              defer.resolve(file);
            } else {
              $log.error('Lived File Format Not Supported Yet !');
              $rootScope.$broadcast('file:ready');
              defer.reject();
            }
          })
          .catch(function (err) {
            $log.error('Error Getting File name and URL From Server.', err);
            $rootScope.$broadcast('file:ready');
            defer.reject();
          });
      }
      return defer.promise;
    }

    function uploadFile(fileName, channelId, memberId, fileData, message) {
      var deferred = $q.defer();
      uploadQueue.push({
        fileName: fileName,
        channelId: channelId,
        memberId: memberId,
        fileData: fileData,
        message: message,
        deferred: deferred
      });
      if (uploadQueue.length === 1) {
        upload();
      }
      return deferred.promise;
    }

    function upload() {
      var fileData = uploadQueue[0];
      var uploadPromise = Upload.upload({
        url: '/api/v1/files/upload/' + fileData.fileName,
        data: {
          name: fileData.fileName,
          channel: fileData.channelId,
          sender: fileData.memberId,
          file: fileData.fileData
        },
        method: 'PUT'
      });
      uploadPromise.then(function (res) {
        fileData.message.uploadPromise = null;
        fileData.deferred.resolve(res);
      }, function (err) {
        if (fileData.message.isUploadAborted) {
          $rootScope.$broadcast('remove:scopeMessage', fileData.message.timestamp);
        } else {
          $log.error('Error status: ' + err.status);
          if (err.data && err.data[0] ===
            'Team reached total storage limit.')
            $rootScope.$broadcast('file:uploadError', 'storageError');
          else if (err.data && err.data[0] === 'File too large.')
            $rootScope.$broadcast('file:uploadError', 'sizeLimit');
          else
            $rootScope.$broadcast('file:uploadError', 'uploadError');
          fileData.deferred.reject();
        }
      }, function (evt) {
        var percent = parseInt(100.0 * evt.loaded / evt.total);
        if (percent === 100)
          fileData.message.uploadProgressBar.complete();
        else
          fileData.message.uploadProgressBar.set(percent);
      });
      uploadPromise.finally(function () {
        uploadQueue.shift();
        if (uploadQueue.length > 0) {
          upload();
        }
      });
      fileData.message.uploadPromise = uploadPromise;
    }

    function getFileManagerFiles(channelId) {
      var deferred = $q.defer();
      $http({
          method: 'GET',
          url: '/api/v1/files/channels/' + channelId + '/'
        })
        .then(function (filesData) {
          var files = filesData.data.map(function (file) {
            return new FileManagerFile(file.id, file.file, file.name,
              file.date_uploaded, file.type);
          });
          deferred.resolve(files);
        })
        .catch(function (err) {
          $log.info('Error Getting FileManager Files.', err);
          deferred.reject(err);
        });
      return deferred.promise;
    }

    function viewFile(fileId) {
      if (self.livedFile && self.livedFile.id === fileId) {
        updateLiveFile();
      } else {
        getFileById(fileId)
          .then(function (file) {
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
        teamId: Team.id,
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

    function createFileManagerFile(id, url, name, date, type) {
      var file = new FileManagerFile(id, file, name, date, type);
      $rootScope.$broadcast('file:newFileManagerFile', file);
    }

    function showFileLine(fileId, startLine, endLine) {
      getFileById(fileId)
        .then(function (file) {
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
      uploadFile: uploadFile,
      getFileManagerFiles: getFileManagerFiles,
      viewFile: viewFile,
      createFileManagerFile: createFileManagerFile
    };
  }

]);
