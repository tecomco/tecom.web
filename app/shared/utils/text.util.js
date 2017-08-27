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

  function htmlify(text) {
    var wellFormedText = '';
    var isUrlifyTurn = true;
    var textParts = text.split('`');
    for (var i = 0; i < textParts.length - 1; i++) {
      if (isUrlifyTurn)
        wellFormedText += urlify(directionify(textParts[i]));
      else
        wellFormedText += codify(textParts[i]);
      isUrlifyTurn = !isUrlifyTurn;
    }
    wellFormedText += urlify(directionify(textParts[textParts.length - 1]));
    return wellFormedText;
  }

  function urlify(text) {
    var urlRegex =
      /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#\?&//=]*)?/gi;
    return text.replace(urlRegex, function (url) {
      if (validUrl(url)) {
        var href = url;
        if (url.indexOf('//') === -1)
          href = '//' + url;
        return '<a href="' + href + '" target="_blank">' + url +
          '</a>';
      } else
        return url;
    });
  }

  function validUrl(url) {
    var tld = ['com', 'ir', 'net', 'org', 'biz', 'info', 'name', 'me', 'ws',
      'us', 'tv', 'gov', 'co', 'edu', 'asia', 'int', 'tel', 'mil', 'coop',
      'io', 'jobs', 'mobi', 'pro'
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
    return '<code class="msg-inline-code" dir="ltr">' + text +
      '</code>';
  }

  function directionify(text) {
    var EnglishRegex = /\b((?!=|\,|\.).)+(.)\b/;
    if (!EnglishRegex.test(text))
      return text;
    var textBody = '';
    var englishTextTemp = '';
    var textParts = text.split(' ');
    for (var i = 0; i < textParts.length; i++) {
      if (!isEnglish(textParts[i])) {
        if (englishTextTemp.length) {
          textBody += generateDirectionifyText(englishTextTemp.trim());
          englishTextTemp = '';
          textBody += ' ';
        }
        textBody += generateDirectionifyText(textParts[i]);
        if (i !== textParts.length - 1)
          textBody += ' ';
      } else {
        englishTextTemp += textParts[i];
        if (i !== textParts.length - 1)
          englishTextTemp += ' ';
      }
    }
    if (englishTextTemp.length)
      textBody += generateDirectionifyText(englishTextTemp.trim());
    return textBody;
  }

  function generateDirectionifyText(word) {
    if (word === ' ')
      return '';
    else if (!isEnglish(word))
      return word;
    else
      return '<span style="direction:ltr" dir="ltr">' + word + '</span> ';
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
    htmlify: htmlify,
    hashtagify: hashtagify,
    persianify: persianify,
    htmlToPlaintext: htmlToPlaintext
  };
});
