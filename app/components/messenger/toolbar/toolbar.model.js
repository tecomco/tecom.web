'use strict';

app.factory('Toolbar', [function () {

  function Toolbar() {}

  Toolbar.TOOL = {
    FILE: 1,
    LIVE: 2,
  };

  return Toolbar;
}]);
