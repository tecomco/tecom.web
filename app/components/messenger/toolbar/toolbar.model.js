'use strict';

app.factory('Toolbar', [function () {

  function Toolbar() {}

  Toolbar.TOOL = {
    FILEMANAGER: 1,
    LIVE: 2,
  };

  return Toolbar;
}]);
