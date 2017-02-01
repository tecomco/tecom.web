'use strict';

app.controller('filesController', [
  '$window', 'filesService', '$scope',
  function ($window, filesService, $scope) {

    $scope.file = {};

    filesService.updateLiveFile();

    $scope.$on('channels:updated', function (event, data) {
      if (data === 'init') {
        filesService.updateLiveFile();
      }
    });

    $scope.$on('file:lived', function (event, fileData) {
      var prettifiedFile = $window.PR.prettyPrintOne(fileData, '', true);
      var el = document.createElement('html');
      el.innerHTML = prettifiedFile;
      var listItems = el.getElementsByTagName('li');
      for (var i = 0; i < listItems.length; i++) {
        var listItem = listItems[i];
        listItem.setAttribute('ng-click', 'lineClick(' + i + ')');
      }
      var listItemsArr = [].map.call(listItems, function (node) {
        return node.innerHTML;
      });
      $scope.file.lines = listItemsArr;
    });

    $scope.lineClick = function (lineNum) {
      console.log('bitch', lineNum);
    }

  }
]);
