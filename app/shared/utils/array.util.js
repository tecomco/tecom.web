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

  var getIndexByValue = function (array, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] == value) {
        return i;
      }
    }
    return -1;
  };

  var lastElement = function (array) {
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

  var contains = function(array, value) {
    return (array.indexOf(value) > -1);
  };

  var containsKeyValue = function(array, key, value) {
    return (getIndexByKeyValue(array, key, value) > -1);
  };

  return {
    getIndexByKeyValue: getIndexByKeyValue,
    lastElement: lastElement,
    removeElementByIndex: removeElementByIndex,
    removeElementByKeyValue: removeElementByKeyValue,
    contains: contains,
    containsKeyValue: containsKeyValue,
    removeElementByValue: removeElementByValue,
    getIndexByValue: getIndexByValue

  };
});