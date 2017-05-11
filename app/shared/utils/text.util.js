'use strict';

app.factory('textUtil', function () {

  function isEnglish(text) {
    if (!text)
      return false;
    var english = /^[a-zA-Z0-9.?></\\:;,{}()$[\]\-_+=!@#$%\^&*|'"]*$/;
    var isEnglish = true;
    text.split(' ').forEach(function (word) {
      isEnglish = isEnglish && english.test(word);
      if (!isEnglish) return;
    });
    return isEnglish;
  }

  function urlify(text) {
    var urlRegex = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
    return text.replace(urlRegex, function (url) {
      return '<a href="' + url + '" target="_blank">' + url + '</a>';
    });
  }

  function prettify(text) {
    var pretty = /`(.*?)`/g;
    return text.replace(pretty, function (backTickedText) {
      return '<span class="msg-inline-code">' + backTickedText + '</span>';
    });
  }

  function directionify(text) {
    var direction = /([^\u0600-\u065F\u066E-\u06D5]+)[`(.*?)`]/g;
    text = text.replace(direction, function (dirText) {
      if (dirText.indexOf('<') !== -1 && dirText.indexOf('`') !== -1) {
        return '<span style="direction:ltr" dir="ltr">' + dirText + '</span> ';
      }
      return dirText;
    });
    return text.replace(/`/g,'');
  }

  /**
   * @todo Fix this function.
   */
  function hashtagify(text) {
    var hashtagRegex = /(^|\W)(#[a-z\d][\w-]*)/ig;
    return text.replace(hashtagRegex, '$1<a href="/$2">$2</a>');
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

  function htmlToPlaintext(text) {
    var plainText = text.replace(/</g,'&lt');
    plainText = plainText.replace(/>/g,'&gt');
    return plainText;
  }

  return {
    isEnglish: isEnglish,
    urlify: urlify,
    prettify: prettify,
    directionify: directionify,
    hashtagify: hashtagify,
    persianify: persianify,
    htmlToPlaintext: htmlToPlaintext
  };
});
