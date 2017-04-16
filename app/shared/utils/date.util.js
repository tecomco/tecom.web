'use strict';

app.factory('dateUtil', ['$window', function ($window) {

  function getPersianDateString(datetime) {
    var pDate = $window.persianDate(datetime);
    return pDate.format("dddd DD MMMM");
  }

  return {
    getPersianDateString: getPersianDateString
  };
}]);
