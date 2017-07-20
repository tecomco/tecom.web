'use strict';

var app = angular.module('tecomApp', [
  'ui.router', 'ngStorage', 'angular-jwt', 'ui.bootstrap', 'config',
  'ngFileUpload', 'ngSanitize', 'mwl.confirm', 'ngMessages',
  'angular-web-notification', 'ngProgress', 'bm.uiTour'
]);

app.config(['$httpProvider', 'jwtOptionsProvider', '$localStorageProvider',
  function ($httpProvider, jwtOptionsProvider, $localStorageProvider) {

    jwtOptionsProvider.config({
      tokenGetter: function () {
        return $localStorageProvider.get('token');
      }
    });

    $httpProvider.interceptors.push('jwtInterceptor');
  }
]);

app.config(['$httpProvider', 'jwtInterceptorProvider',
  function ($httpProvider, jwtInterceptorProvider) {
    jwtInterceptorProvider.authPrefix = 'JWT ';
  }
]);

app.run(['$rootScope', '$timeout', function ($rootScope, $timeout) {
  $rootScope.isLoading = true;
  $rootScope.socketConnected = true;
  $rootScope.hasUnread = false;
  $rootScope.isLoadingTakingTooLong = false;
  $timeout(function () {
    $rootScope.isLoadingTakingTooLong = true;
  }, 10000);
}]);
