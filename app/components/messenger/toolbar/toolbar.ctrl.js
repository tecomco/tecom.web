'use strict';

app.controller('toolbarController', '$scope', 'Toolbar', [function ($scope,
  Toolbar) {

  $scope.activeTool = Toolbar.TOOL.LIVE;

  $scope.showSelectedTool = function (toolNum) {
    $scope.activeTool = toolNum;
  };

  $scope.getToolbarIconCss = function (toolNum) {
    if ($scope.activeTool === toolNum)
      return 'selected'
    return '';
  };

}]);
