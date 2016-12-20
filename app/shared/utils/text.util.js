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

  return {
    isEnglish: isEnglish,
    urlify: urlify
  };
});
