'use strict';

app.factory('arrayUtil', function () {
  return {
    getIndexByKeyValue: function (array, name, value) {
      for (var i = 0; i < array.length; i++) {
        if (array[i][name] == value) {
          return i;
        }
      }
      return -1;
    },
    lastElement: function (array) {
      if(array.length === 0)
        return null;
      return array[array.length-1];
    },
  };
});