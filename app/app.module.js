'use strict';

var app = angular.module('tecomApp', [
  'ui.router', 'ngStorage', 'angular-jwt', 'ui.bootstrap', 'config',
  'ngFileUpload', 'ngSanitize', 'mwl.confirm', 'ngMessages',
  'angular-web-notification', 'ngProgress', 'bm.uiTour'
]);

app.config(['$httpProvider', 'jwtOptionsProvider', '$localStorageProvider',
  'ENV',
  function ($httpProvider, jwtOptionsProvider, $localStorageProvider, ENV) {

    var config = {
      tokenGetter: function () {
        return $localStorageProvider.get('token');
      }
    }
    if (!ENV.isWeb)
      config.whiteListedDomains = ['http://localhost:8000'];

    jwtOptionsProvider.config(config);

    $httpProvider.interceptors.push('jwtInterceptor');

    if (!ENV.isWeb)
      $httpProvider.interceptors.push(function ($q, ENV) {
        return {
          request: function (config) {
            if (config.url.indexOf('.html') === -1)
              config.url = ENV.apiUri + config.url;
            return config || $q.when(config);
          }
        };
      });
  }
]);

app.config(['$httpProvider', 'jwtInterceptorProvider',
  function ($httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.authPrefix = 'JWT ';
  }
]);

app.config(['TourConfigProvider', function (TourConfigProvider) {
  TourConfigProvider.set('scrollIntoView', false);
  TourConfigProvider.set('backdropBorderRadius', 5);
  TourConfigProvider.set('useHotkeys', true);
}]);

app.run(['$rootScope', '$timeout', function ($rootScope, $timeout) {
  $rootScope.isLoading = true;
  $rootScope.socketConnected = true;
  $rootScope.hasUnread = false;
  $rootScope.isLoadingTakingTooLong = false;
  $timeout(function () {
    $rootScope.isLoadingTakingTooLong = true;
  }, 10000);
}]);
