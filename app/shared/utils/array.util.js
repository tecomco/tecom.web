'use strict';

app.factory('ArrayUtil', function () {

  var getIndexByKeyValue = function (array, key, value) {
    var keySplit = key.split('.');
    for (var i = 0; i < array.length; i++) {
      var temp = array[i];
      for (var k = 0; k < keySplit.length; k++){
        temp = temp[keySplit[k]];
      }
      if (temp == value) {
        return i;
      }
    }
    return -1;
  };

  var getIndexByValue = function (array, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] == value) {
        return i;
      }
    }
    return -1;
  };

  function getElementByKeyValue(array, key, value) {
    var index = getIndexByKeyValue(array, key, value);
    if (index === -1) return null;
    return array[index];
  }

  var getLastElement = function (array) {
    if (array.length === 0)
      return null;
    return array[array.length - 1];
  };

  var removeElementByIndex = function (array, index) {
    if (index > -1)
      array.splice(index, 1);
  };

  var removeElementByKeyValue = function (array, key, value) {
    var index = getIndexByKeyValue(array, key, value);
    if (index > -1)
      array.splice(index, 1);
  };

  var removeElementByValue = function (array, value) {
    var index = getIndexByValue(array, value);
    if (index > -1)
      array.splice(index, 1);
  };

  var contains = function (array, value) {
    return (array.indexOf(value) > -1);
  };

  var containsKeyValue = function (array, key, value) {
    return (getIndexByKeyValue(array, key, value) > -1);
  };

  return {
    getIndexByKeyValue: getIndexByKeyValue,
    getIndexByValue: getIndexByValue,
    getElementByKeyValue: getElementByKeyValue,
    getLastElement: getLastElement,
    removeElementByIndex: removeElementByIndex,
    removeElementByKeyValue: removeElementByKeyValue,
    contains: contains,
    containsKeyValue: containsKeyValue,
    removeElementByValue: removeElementByValue
  };
});
