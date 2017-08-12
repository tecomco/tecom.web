'use strict';
/*jshint esversion: 6 */

app.service('cache', ['CurrentMember','$window',
  function (CurrentMember, $window) {

    var self = this;

    if (!CurrentMember.exists()) return;
    createCache();

    function createCache() {
      let cache = new $window.LRUMap(3);
      self.cache = cache;
    }

    function getCache() {
      return self.cache;
    }

    return {
      createCache: createCache,
      getCache: getCache
    };
  }
]);
