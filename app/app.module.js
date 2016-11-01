'use strict';

/**
 * Main angular application module.
 *
 * @module app
 */
var app = angular.module('tecomApp', [
  'ui.router', 'ngStorage', 'angular-jwt', 'ui.bootstrap', 'config'
]);

app.config(['$httpProvider', '$localStorageProvider', 'jwtOptionsProvider',
  function ($httpProvider, $localStorageProvider, jwtOptionsProvider) {

    jwtOptionsProvider.config({
      tokenGetter: function () {
        return $localStorageProvider.get('userToken');
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
