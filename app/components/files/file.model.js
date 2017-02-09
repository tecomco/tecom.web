'use strict';

app.factory('File', ['$http', '$window', 'Line',
  function ($http, $window, Line) {

    function File(id, url, fileData, name, channelId) {
      this.id = id;
      this.url = url;
      this.name = name;
      this.channelId = channelId;
      this.lines = getLinesByData(fileData);
    }

    function getLinesByData(fileData) {
      var lines = [];
      var prettifiedFile = $window.PR.prettyPrintOne(fileData, '', true);
      var el = document.createElement('html');
      el.innerHTML = prettifiedFile;
      var listItems = el.getElementsByTagName('li');
      for (var i = 0; i < listItems.length; i++) {
        var listItem = listItems[i];
        listItem.setAttribute('ng-click', 'lineClick(' + i + ')');
        var line = new Line(i + 1, listItem.innerHTML);
        lines.push(line);
      }
      return lines;
    }

    File.prototype.selectTempLine = function (lineNum) {
      if(this.selectedTemp)
        this.deselectTempLine(this.selectedTemp);
      if(this.selectedTemp !== lineNum) {
        var line = this.getLine(lineNum);
        line.setSelected(Line.SELECT_TYPE.TEMPORARY, true);
        this.selectedTemp = lineNum;
      }
      else{
        this.selectedTemp = null;
      }
    };

    File.prototype.deselectTempLine = function (lineNum) {
      this.lines[lineNum - 1].setSelected(Line.SELECT_TYPE.TEMPORARY, false);
    };

    File.prototype.selectPermLine = function (lineNum) {
      this.lines.forEach(function (line) {
        if (line.num !== lineNum)
          line.setSelected(Line.SELECT_TYPE.PERMENANT, false);
        else
          line.setSelected(Line.SELECT_TYPE.PERMENANT, true);
      });
    };

    File.prototype.getLine = function(lineNum){
      return this.lines[lineNum - 1];
    };

    File.prototype.getSelectedTempLine = function()
    {
      return this.selectedTemp;
    };

    File.prototype.deselectFilelines = function()
    {
      if(this.selectedTemp) {
        this.deselectTempLine(this.selectedTemp);
        this.selectedTemp = null;
      }
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


app.factory('Line', ['$timeout', function ($timeout) {

  function Line(number, html) {
    this.num = number;
    this.html = html;
    this.tempSelected = false;
    this.permSelected = false;
  }

  Line.prototype.setSelected = function (selectType, value) {
    switch (selectType) {
      case Line.SELECT_TYPE.TEMPORARY:
        if (this.tempSelected === true && value === true)
          this.tempSelected = false;
        else
          this.tempSelected = value;
        break;
      case Line.SELECT_TYPE.PERMENANT:
        this.permSelected = value;
        var that = this;
        if (this.permTimeout) {
          $timeout.cancel(this.permTimeout);
        }
        this.permTimeout = $timeout(function () {
          that.permSelected = false;
        }, 2000);
        break;
    }
  };

  Line.prototype.getCssClass = function () {
    if (this.tempSelected) {
      return 'line-temp-selected';
    } else if (this.permSelected) {
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
