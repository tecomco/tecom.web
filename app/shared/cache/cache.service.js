'use strict';
/*jshint esversion: 6 */

app.service('CacheService', ['$window', function ($window) {

  var self = this;
  var CACHE_MAX_SIZE = 3;

  createCache();

  function createCache() {
    self.cache = new $window.LRUMap(CACHE_MAX_SIZE);
  }

  function getCache() {
    return self.cache;
  }

  return {
    getCache: getCache
  };
}]);
