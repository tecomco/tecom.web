'use strict';

app.factory('authInterceptor', ['$q', '$log', '$localStorage', '$window',
    function ($q, $log, $localStorage, $window) {
      return {
        responseError: function (rejection) {
          $log.error('Http response error. Rejection status:', rejection.status);
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
    }
  ])
  .config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  }]);
