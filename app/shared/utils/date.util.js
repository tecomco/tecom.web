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

  function isMessageDateInAnotherDay(prevDatetime, datetime) {
    var isYearDifferent = datetime.getFullYear() !== prevDatetime.getFullYear();
    var isMonthDifferent = datetime.getMonth() !== prevDatetime.getMonth();
    var isDayDifferent = datetime.getDate() !== prevDatetime.getDate();
    return isYearDifferent || isMonthDifferent || isDayDifferent;
  }

  return {
    getPersianDateString: getPersianDateString,
    getPersianTime: getPersianTime,
    isMessageDateInAnotherDay: isMessageDateInAnotherDay
  };
}]);
