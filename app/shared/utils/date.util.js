'use strict';

app.factory('dateUtil', function () {

  function getPersianDateString(datetime){
    var pDate = persianDate(datetime);
    return pDate.format("dddd DD MMMM");
  }
  return {
    getPersianDateString: getPersianDateString,
  };
});
