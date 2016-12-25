'use strict';

app.factory('textUtil', function () {

  function isEnglish(text) {
    var english = /^[A-Za-z0-9]*$/;
    return english.test(text);
  }

  function urlify(text) {
    if (typeof text !== 'string') return text.toString();
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function (url) {
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
  }

  function persianify(text) {
    var persian = {
      0: '۰',
      1: '۱',
      2: '۲',
      3: '۳',
      4: '۴',
      5: '۵',
      6: '۶',
      7: '۷',
      8: '۸',
      9: '۹'
    };
    var list = text.match(/[0-9]/g);
    if (list !== null && list.length !== 0) {
      for (var i = 0; i < list.length; i++) {
        text = text.replace(list[i], persian[list[i]]);
      }
    }
    return text;
  }

  return {
    isEnglish: isEnglish,
    urlify: urlify,
    persianify: persianify
  };
});
