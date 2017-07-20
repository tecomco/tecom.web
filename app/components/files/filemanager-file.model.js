'use strict';

app.factory('FileManagerFile', ['dateUtil', 'fileUtil',
  function (dateUtil, fileUtil) {

    function FileManagerFile(id, url, name, date, type) {
      this.id = id;
      this.url = url;
      this.name = name;
      this.date = date;
      this.type = fileUtil.fileManagerFileFormat(type);
      this.extension = type;
      this.svg = this.getSvgUrl();
    }

    FileManagerFile.prototype.getSvgUrl = function () {
      return '/static/img/file-formats.svg#' + this.extension;
    };

    FileManagerFile.prototype.getFileName = function () {
      return this.name.replace('.' + this.extension, '');
    };

    FileManagerFile.prototype.canBeLived = function () {
      return fileUtil.isTextFormat(this.extension);
    };

    FileManagerFile.prototype.getLocalDate = function () {
      return dateUtil.getPersianDateString(new Date(this.date));
    };

    FileManagerFile.prototype.downloadFile = function () {
      var link = document.createElement("a");
      link.download = this.name;
      link.href = this.url;
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