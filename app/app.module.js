'use strict';

var app = angular.module('tecomApp', [
  'ui.router', 'ngStorage', 'angular-jwt', 'ui.bootstrap', 'config',
  'angularMoment', 'ngSanitize', 'ngFileUpload', 'ui-notification'
]);

app.config(['$httpProvider', 'jwtOptionsProvider', 'UserProvider',
  function ($httpProvider, jwtOptionsProvider, UserProvider) {

    jwtOptionsProvider.config({
      tokenGetter: function () {
        return UserProvider.$get().token;
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
