'use strict';

app.factory('dateUtil', ['$window', function ($window) {

  function getPersianDateString(datetime) {
    var pDate = $window.persianDate(datetime);
    return pDate.format('dddd DD MMMM');
  }

  function getPersianTime(datetime) {
    var pDate = $window.persianDate(datetime);
    return pDate.format('h:mm');
  }

  return {
    getPersianDateString: getPersianDateString,
    getPersianTime: getPersianTime
  };
}]);
