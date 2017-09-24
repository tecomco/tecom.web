'use strict';

app.factory('authInterceptor', ['$q', '$log', '$localStorage', '$window', 'ENV',
    function ($q, $log, $localStorage, $window, ENV) {
      return {
        responseError: function (rejection) {
          $log.error('Http response error. Rejection status:', rejection.status);
          switch (rejection.status) {
            case 401:
              $localStorage.token = null;
              if (ENV.isWeb)
                $window.location.assign('/login?err=InvalidToken');
              else
                $window.location.assign(
                  '/login.electron.html?err=InvalidToken');
              // const foo = require('electron').remote
              // foo.getCurrentWindow().loadURL(
              //   `file://${__dirname}/app/components/login/login.html?err=InvalidToken`)
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
