'use strict';

app.factory('ArrayUtil', function () {

  function getIndexByKeyValue(array, key, value) {
    var keySplit = key.split('.');
    for (var i = 0; i < array.length; i++) {
      var temp = array[i];
      for (var k = 0; k < keySplit.length; k++) {
        temp = temp[keySplit[k]];
      }
      if (temp == value) {
        return i;
      }
    }
    return -1;
  }

  function getIndexByValue(array, value) {
    for (var i = 0; i < array.length; i++) {
      if (array[i] == value) {
        return i;
      }
    }
    return -1;
  }

  function getElementByKeyValue(array, key, value) {
    var index = getIndexByKeyValue(array, key, value);
    if (index === -1) return null;
    return array[index];
  }

  function removeElementByIndex(array, index) {
    if (index > -1)
      array.splice(index, 1);
  }

  function removeElementByKeyValue(array, key, value) {
    var index = getIndexByKeyValue(array, key, value);
    if (index > -1)
      array.splice(index, 1);
  }

  function removeElementByValue(array, value) {
    var index = getIndexByValue(array, value);
    if (index > -1)
      array.splice(index, 1);
  }

  function contains(array, value) {
    return (array.indexOf(value) > -1);
  }

  function containsKeyValue(array, key, value) {
    return (getIndexByKeyValue(array, key, value) > -1);
  }

  function sortByKeyDesc(array, key) {
    array.sort(function (a, b) {
      if (a[key] < b[key]) return 1;
      if (a[key] > b[key]) return -1;
      return 0;
    });
  }

  function sortByKeyAsc(array, key) {
    array.sort(function (a, b) {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
  }

  function getElementsRangeByKeyValue(array, key, from, to) {
    var rangeElements = [];
    for (var i = 0; i < array.length; i++) {
      if (array[i][key] >= from && array[i][key] <= to)
        rangeElements.push(array[i]);
    }
    sortByKeyAsc(rangeElements, key);
    return rangeElements;
  }


  return {
    getIndexByKeyValue: getIndexByKeyValue,
    getIndexByValue: getIndexByValue,
    getElementByKeyValue: getElementByKeyValue,
    removeElementByIndex: removeElementByIndex,
    removeElementByKeyValue: removeElementByKeyValue,
    contains: contains,
    containsKeyValue: containsKeyValue,
    removeElementByValue: removeElementByValue,
    sortByKeyDesc: sortByKeyDesc,
    sortByKeyAsc: sortByKeyAsc,
    getElementsRangeByKeyValue: getElementsRangeByKeyValue
  };
});
