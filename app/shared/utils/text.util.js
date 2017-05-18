'use strict';

app.factory('textUtil', function () {

  function isEnglish(text) {
    if (!text)
      return false;
    var english = /^[a-zA-Z0-9.?></\\:;,{}()$[\]\-_+=!@#$%\^&*|'"` ]*$/;
    var isEnglish = true;
    text.split(' ').forEach(function (word) {
      isEnglish = isEnglish && english.test(word);
      if (!isEnglish) return;
    });
    return isEnglish;
  }

  function urlify(text) {
    var urlRegex =
      /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#\?&//=]*)?/gi;
    return text.replace(urlRegex, function (url) {
      if (validUrl(url))
        return '<a href="' + url + '" target="_blank">' + url +
          '</a>';
      else
        return url;
    });
  }

  function validUrl(url) {
    var tld = ['com', 'ir', 'net', 'org', 'biz', 'info', 'name', 'me', 'ws',
      'us', 'tv', 'gov', 'co', 'edu', 'asia', 'int', 'tel', 'mil'
    ];
    url = url.split('.');
    url = url[url.length - 1];
    for (var i = 0; i < tld.length; i++) {
      if (url.substring(0, tld[i].length) === tld[i])
        return true;
    }
    return false;
  }

  function codify(text) {
      return '<code class="msg-inline-code">' + text +
        '</code>';
  }

  function directionify(text) {
    var directionRegex = /([^\u0600-\u065F\u066E-\u06D5]+)/g;
    return text.replace(directionRegex, function (englishPart) {
      if (englishPart.indexOf('<') !== -1 && englishPart.indexOf('`') !== -1) {
        return '<span style="direction:ltr" dir="ltr">' + englishPart +
          '</span> ';
      }
      return englishPart;
    });
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
    var plainText = text.replace(/</g, '&lt');
    plainText = plainText.replace(/>/g, '&gt');
    plainText = plainText.replace(/{/g, '&#123;&zwnj;');
    plainText = plainText.replace(/}/g, '&zwnj;&#125;');
    return plainText;
  }

  return {
    isEnglish: isEnglish,
    urlify: urlify,
    codify: codify,
    directionify: directionify,
    hashtagify: hashtagify,
    persianify: persianify,
    htmlToPlaintext: htmlToPlaintext
  };
});
