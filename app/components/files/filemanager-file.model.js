'use strict';

app.factory('FileManagerFile', ['dateUtil', 'fileUtil', 'ENV',
  function (dateUtil, fileUtil, ENV) {

    function FileManagerFile(id, url, name, date, type) {
      this.id = id;
      this.url = url;
      this.name = name;
      this.date = new Date(date);
      this.extension = type;
      this.type = this.getFileType();
      this.svg = this.getSvgUrl();
    }

    FileManagerFile.prototype.getSvgUrl = function () {
      return (!ENV.isWeb ? '' : ENV.staticUri) +
        '/static/img/file-formats.svg#' + this.extension;
    };

    FileManagerFile.prototype.getFileName = function () {
      return this.name.replace('.' + this.extension, '');
    };

    FileManagerFile.prototype.canBeLived = function () {
      return fileUtil.isTextFormat(this.extension);
    };

    FileManagerFile.prototype.isPhoto = function () {
      return fileUtil.isPictureFormat(this.extension);
    };

    FileManagerFile.prototype.getLocalDate = function () {
      return dateUtil.getPersianDateString(this.date);
    };

    FileManagerFile.prototype.getFileType = function () {
      return fileUtil.fileManagerFileFormat(this.extension);
    };

    FileManagerFile.prototype.downloadFile = function () {
      var link = document.createElement('a');
      link.download = this.name;
      link.href = ENV.staticUri + this.url;
      link.click();
    };

    FileManagerFile.TYPE = {
      CODE: 1,
      PICTURE: 2,
      DOCUMENT: 3,
      OTHER: 4
    };

    return FileManagerFile;
  }
]);
