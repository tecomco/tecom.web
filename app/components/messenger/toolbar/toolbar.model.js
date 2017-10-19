'use strict';

app.factory('Toolbar', [function () {

  function Toolbar() {}

  Toolbar.TOOL = {
    FILE: 0,
    LIVE: 1,
  };

  return Toolbar;
}]);
