'use strict';

app.factory('arrayUtil', function () {

  var getIndexByKeyValue = function (array, key, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] == value) {
        return i;
      }
    }
    return -1;
  };

  var lastElement = function (array) {
    if(array.length === 0)
      return null;
    return array[array.length-1];
  };

  var removeElement = function(array, index){
    if (index > -1)
      array.splice(index, 1);
  };

  var removeElementByKeyValue = function(array, key, value){
    var index = getIndexByKeyValue(array,key,value);
    if (index > -1)
      array.splice(index, 1);
  };

  return {
    getIndexByKeyValue: getIndexByKeyValue,
    lastElement: lastElement,
    removeElement: removeElement,
    removeElementByKeyValue: removeElementByKeyValue
  };
});