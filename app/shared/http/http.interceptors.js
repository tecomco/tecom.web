'use strict';

app.factory('authInterceptor', ['$q', '$localStorage', '$window',
  function ($q, $localStorage, $window) {
    return {
      'responseError': function (rejection) {
        console.log('rejection.status:', rejection.status);
        switch (rejection.status) {
          case 401:
          $localStorage.token = null;
          $window.location.assign('/login?err=InvalidToken');
            break;
          default:
            break;
        }
        return $q.reject(rejection);
      }
    };
  }])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  }]);