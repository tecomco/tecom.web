'use strict';

app.factory('dateUtil', ['$window', function ($window) {

  function getPersianDateString(datetime) {
    var pDate = $window.persianDate(datetime);
    return pDate.format('dddd DD MMMM');
  }

  function getPersianTime(datetime) {
    var pDate = $window.persianDate(datetime);
    return pDate.format('H:mm');
  }

  function isTwoDatesInAnotherDay(firstDate, secondDate) {
    var isYearDifferent = firstDate.getFullYear() !== secondDate.getFullYear();
    var isMonthDifferent = firstDate.getMonth() !== secondDate.getMonth();
    var isDayDifferent = firstDate.getDate() !== secondDate.getDate();
    return isYearDifferent || isMonthDifferent || isDayDifferent;
  }

  return {
    getPersianDateString: getPersianDateString,
    getPersianTime: getPersianTime,
    isTwoDatesInAnotherDay: isTwoDatesInAnotherDay
  };
}]);
