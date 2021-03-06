'use strict';

app.factory('FileManagerFile', ['dateUtil', 'fileUtil',
  function (dateUtil, fileUtil) {

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
      return '/static/img/file-formats.svg#' + this.extension;
    };

    FileManagerFile.prototype.getFileName = function () {
      return fileUtil.getFileName(this.name);
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
      return fileUtil.getFileManagerFileFormat(this.extension);
    };

    FileManagerFile.prototype.downloadFile = function () {
      var link = document.createElement('a');
      link.download = this.name;
      link.href = this.url;
      link.click();
    };

    FileManagerFile.TYPE = {
      CODE: 'code',
      PICTURE: 'picture',
      DOCUMENT: 'document',
      OTHER: 'other'
    };

    return FileManagerFile;
  }
]);
