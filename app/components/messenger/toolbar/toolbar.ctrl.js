'use strict';

app.controller('toolbarController', ['$rootScope', '$scope', 'Toolbar',
  function ($rootScope, $scope, Toolbar) {

    $rootScope.toolbarActiveTool = null;
    $scope.doesChannelHaveAnyLivedFile = false;
    var isFileManagerInitialized = false;
    var isFileManagerInitializing = false;

    $scope.$on('toolbar:activate:live', function () {
      $rootScope.toolbarActiveTool = Toolbar.TOOLS.LIVE;
    });

    $scope.$on('toolbar:fileManager:initializeStatus',
      function (event, status) {
        isFileManagerInitializing = false;
        isFileManagerInitialized = status;
      });

    $scope.$on('file:lived', function (event, file) {
      $scope.doesChannelHaveAnyLivedFile = true;
    });

    $scope.$on('file:killed', function (event, file) {
      $scope.doesChannelHaveAnyLivedFile = false;
    });

    $scope.toggleTool = function (toolName) {
      if (toolName === Toolbar.TOOLS.FILEMANAGER && !
        isFileManagerInitialized && !isFileManagerInitializing) {
        isFileManagerInitializing = true;
        $rootScope.$broadcast('toolbar:initialize:fileManager');
        isFileManagerInitialized = true;
      }
      $rootScope.toolbarActiveTool =
        $rootScope.toolbarActiveTool === toolName ? null : toolName;
    };

    $scope.getToolbarIconCss = function (toolName) {
      if ($rootScope.toolbarActiveTool === toolName)
        return 'selected';
      return '';
    };

  }
]);
