'use strict';

app.factory('inputUtil', function () {

  function isPressedKeyJustLetter(evt) {
    return ((evt.keyCode > 36 && evt.keyCode < 40) ||
      (evt.keyCode > 47 && evt.keyCode < 91) ||
      (evt.keyCode > 95 && evt.keyCode < 112) ||
      (evt.keyCode > 185)) && !evt.ctrlKey && evt.keyCode !== 38;
  }

  return {
    isPressedKeyJustLetter: isPressedKeyJustLetter
  };
});
