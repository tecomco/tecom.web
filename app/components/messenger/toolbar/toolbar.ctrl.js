'use strict';

app.controller('toolbarController', ['$rootScope', '$scope', 'Toolbar',
  function ($rootScope, $scope, Toolbar) {

    $rootScope.activeTool = null;
    $scope.doesChannelHaveAnyLivedFile = false;
    var isFileManagerInitialized = false;

    $scope.$on('active:liveTool', function () {
      $rootScope.activeTool = Toolbar.TOOL.LIVE;
    });

    $scope.$on('file:lived', function (event, file) {
      $scope.doesChannelHaveAnyLivedFile = true;
    });

    $scope.$on('file:killed', function (event, file) {
      $scope.doesChannelHaveAnyLivedFile = false;
    });

    $scope.showSelectedTool = function (toolNum) {
      if (toolNum === Toolbar.TOOL.FILE && !isFileManagerInitialized) {
        $rootScope.$broadcast('initialize:fileManager');
        isFileManagerInitialized = true;
      }
      $rootScope.activeTool = $rootScope.activeTool === toolNum ? null :
        toolNum;
    };

    $scope.getToolbarIconCss = function (toolNum) {
      if ($rootScope.activeTool === toolNum)
        return 'selected';
      return '';
    };

  }
]);
