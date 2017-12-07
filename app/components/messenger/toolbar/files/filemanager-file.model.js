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

    function getFilteredName(name, removeStep) {
      var stringTakeLength =
        name.length % 2 == 0 ? name.length / 2 - removeStep :
        (name.length + 1) / 2 - removeStep;
      return name.substring(0, stringTakeLength) + '....' + name.substr(
        name.length - stringTakeLength);
    }

    FileManagerFile.prototype.getSvgUrl = function () {
      return '/static/img/file-formats.svg#' + this.extension;
    };

    FileManagerFile.prototype.getFileName = function () {
      var removeStep = 0;
      var shouldReturnFilteredName = false;
      var name = this.name.replace('.' + this.extension, '');
      var filteredName = '';
      var fileNameElement = document.createElement('canvas');
      var fileNameCanvas = fileNameElement.getContext("2d");
      fileNameCanvas.font = "16px iransans";
      var width = fileNameCanvas.measureText(name).width;
      while (width > 170) {
        shouldReturnFilteredName = true;
        removeStep = removeStep + 1;
        filteredName = getFilteredName(name, removeStep);
        width = fileNameCanvas.measureText(filteredName).width;
      }
      return shouldReturnFilteredName ? filteredName : name;
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
