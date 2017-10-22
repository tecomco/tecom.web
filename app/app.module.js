'use strict';

var app = angular.module('tecomApp', [
  'ui.router', 'ngStorage', 'angular-jwt', 'ui.bootstrap', 'config',
  'ngFileUpload', 'ngSanitize', 'mwl.confirm', 'ngMessages', 'ngProgress',
  'bm.uiTour', 'angular-web-notification'
]);

app.config([
  '$httpProvider', 'jwtOptionsProvider', '$localStorageProvider', 'ENV',
  function ($httpProvider, jwtOptionsProvider, $localStorageProvider, ENV) {

    var config = {
      tokenGetter: function () {
        return $localStorageProvider.get('token');
      }
    };
    config.whiteListedDomains = [''];
    jwtOptionsProvider.config(config);
    $httpProvider.interceptors.push('jwtInterceptor');
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
