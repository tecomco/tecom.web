'use strict';

app.factory('domainUtil', ['$location', '$localStorage', 'ENV', function (
  $location, $localStorage, ENV) {

  function getSubdomain() {
    if (ENV.isWeb) {
      var host = $location.host();
      if (host.indexOf('.') < 0) {
        return '';
      } else {
        return host.split('.')[0];
      }
    } else {
      console.log($localStorage.teamSlug);
      return $localStorage.teamSlug;
    }
  }

  return {
    getSubdomain: getSubdomain,
  };

}]);
