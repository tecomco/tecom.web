'use strict';

app.controller('toolbarController', ['$rootScope', '$scope', 'Toolbar',
  function ($rootScope, $scope, Toolbar) {

    $rootScope.activeTool = null;
    var isFileManagerInitialized = false;

    $scope.$on('active:liveTool', function () {
      $rootScope.activeTool = Toolbar.TOOL.LIVE;
    });

    $scope.showSelectedTool = function (toolNum) {
      if (toolNum === Toolbar.TOOL.FILE && !isFileManagerInitialized) {
        $rootScope.$broadcast('initialize:fileManager');
        isFileManagerInitialized = true;
      }
      $rootScope.activeTool = toolNum;
    };

    $scope.getToolbarIconCss = function (toolNum) {
      if ($rootScope.activeTool === toolNum)
        return 'selected'
      return '';
    };

  }
]);
