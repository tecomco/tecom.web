'use strict';

app.factory('File', ['$http', '$window', 'Line', 'fileUtil', '$timeout',
  function ($http, $window, Line, fileUtil, $timeout) {

    function File(id, url, fileData, name, channelId) {
      this.id = id;
      this.url = url;
      this.name = name;
      this.channelId = channelId;
      this.lines = getLinesByData(fileData, this);
      this.isTempSelected = false;
      this.isPermSelected = false;
    }

    function getLinesByData(fileData, file) {
      var lines = [];
      var prettifiedFile = $window.PR.prettyPrintOne(fileData, '', true);
      var el = document.createElement('html');
      el.innerHTML = prettifiedFile;
      var listItems = el.getElementsByTagName('li');
      for (var i = 0; i < listItems.length; i++) {
        var listItem = listItems[i];
        var line = new Line(i + 1, listItem.innerHTML, file);
        lines.push(line);
      }
      return lines;
    }

    File.prototype.selectTempLines = function (type, lineNum) {
      this.isTempSelected = true;
      if (type === 'start')
        this.tempStartLine = lineNum;
      else if (type === 'end')
        this.tempEndLine = lineNum;
    };

    File.prototype.deselectTempLines = function () {
      this.isTempSelected = false;
      this.tempStartLine = null;
      this.tempEndLine = null;
    };

    File.prototype.selectPermLines = function (startLine, endLine) {
      this.isPermSelected = true;
      this.permStartLine = startLine;
      this.permEndLine = endLine;
      var that = this;
      if (this.permTimeout) {
        $timeout.cancel(this.permTimeout);
      }
      this.permTimeout = $timeout(function () {
        that.isPermSelected = false;
      }, 2000);
    };

    File.prototype.getLine = function (lineNum) {
      return this.lines[lineNum - 1];
    };

    File.prototype.getTempLines = function () {
      if(!this.isTempSelected)
        return null;
      else {
        return this.findStartAndEndTempLines(this);
      }
    };

    File.prototype.findStartAndEndTempLines = function(){
      var startTemp = Math.min(this.tempStartLine, this.tempEndLine);
      var endTemp = Math.max(this.tempStartLine, this.tempEndLine);
      return {
        start: startTemp,
        end: endTemp
      };
    };

    File.prototype.isLineTemp = function (lineNumber) {
      if(this.isTempSelected){
        var tempLines = this.findStartAndEndTempLines();
        return (lineNumber >= tempLines.start && lineNumber <= tempLines.end);
      }
      return false;
    };

    // File.prototype.getTabView = function () {
    //   var view = '<li class="doc-tab doc-tab-active">';
    //   view += '<i class="fa fa-circle"></i>';
    //   view += ' ' + this.name;
    //   view += '<i class="fa fa-times"></i></li>';
    //
    //   return view;
    // };

    return File;
  }
]);


app.factory('Line', [function () {

  function Line(number, html, file) {
    this.num = number;
    this.html = html;
    this.file = file;
  }

  Line.prototype.getCssClass = function () {
    if (this.file.isTempSelected) {
      if (this.num >= this.file.tempStartLine && this.num <= this.file.tempEndLine)
        return 'line-temp-selected';
    } else if (this.file.isPermSelected) {
      if (this.num >= this.file.permStartLine && this.num <= this.file.permEndLine)
        return 'line-perm-selected';
    }
  };

  Line.SELECT_TYPE = {
    TEMPORARY: 0,
    PERMENANT: 1
  };

  return Line;
}
]);
