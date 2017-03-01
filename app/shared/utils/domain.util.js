'use strict';

app.factory('domainUtil', ['$location', function ($location) {

  function getSubdomain() {
    var host = $location.host();
    if (host.indexOf('.') < 0) {
      return '';
    } else {
      return host.split('.')[0];
    }
  }

  return {
    getSubdomain: getSubdomain,
  };

}]);
