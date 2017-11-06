'use strict';

app.factory('Toolbar', [function () {

  function Toolbar() {}

  Toolbar.TOOLS = {
    FILEMANAGER: 'fileManager',
    LIVE: 'live',
  };

  return Toolbar;
}]);
