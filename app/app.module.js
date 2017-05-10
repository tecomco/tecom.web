'use strict';

var app = angular.module('tecomApp', [
  'ui.router', 'ngStorage', 'angular-jwt', 'ui.bootstrap', 'config',
  'angularMoment', 'ngFileUpload', 'mwl.confirm', 'ngMessages'
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

app.run(['amMoment', function (amMoment) {
  amMoment.changeLocale('fa');
}]);

app.run(['$rootScope', function ($rootScope) {
  $rootScope.isLoading = true;
  $rootScope.socketConnected = true;
  $rootScope.hasUnread = false;
}]);
