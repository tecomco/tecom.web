'use strict';

var app = angular.module('LoginApp', [
    'ui.router', 'ngStorage', 'angular-jwt', 'ismobile'
  ])
  .config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(true);
  }])
  .config(['$stateProvider', '$urlRouterProvider', 'isMobileProvider',
    function ($stateProvider, $urlRouterProvider, isMobile) {
      $urlRouterProvider.otherwise('/login');
      $stateProvider
        .state('login', {
          url: '/login',
          views: {
            '': {
              templateUrl: 'app/components/login/login-form.html'
            }
          },
          onEnter: function ($window) {
            if (isMobile.phone) {
              var mobileType;
              if (isMobile.apple.phone) {
                mobileType = 'iOS';
              } else if (isMobile.android.phone) {
                mobileType = 'Android';
              } else {
                mobileType = 'Mobile';
              }
              $window.location.assign('/mobile?os=' + mobileType);
            }
          }
        });
    }
  ])
  .controller('loginController', ['$scope', '$log', '$window', '$http', 'AuthService',
    function ($scope, $log, $window, $http, AuthService) {

      $scope.hasLoginError = false;
      $scope.submitClicked = false;
      $scope.isLoading = false;

      $scope.passwordRecoveryUrl = getPasswordRecoveryUrl();

      $scope.login = function () {
        var isFormNotEmpty = $scope.forms.login.email.$valid &&
          $scope.forms.login.password.$valid;
        if (isFormNotEmpty) {
          $scope.isLoading = true;
          AuthService.login($scope.email, $scope.password)
            .then(function () {
              $window.location.assign('/messenger');
            }).catch(function (err) {
              $scope.isLoading = false;
              $log.error('Login Error:', err);
              $scope.hasloginError = false;
              if (err.data) {
                $scope.hasLoginError = true;
                if (typeof err.data === 'object' &&
                  err.data[0] === 'User does not belong to team.')
                  $scope.loginErrorString = 'شما در این تیم عضو نیستید.';
                else if (typeof err.data.non_field_errors === 'object' &&
                  err.data.non_field_errors[0] ===
                  'Unable to log in with provided credentials.')
                  $scope.loginErrorString = 'نام کاربری یا رمزعبور صحیح نمی باشد.';
                else
                  $scope.loginErrorString = 'خطا در اتصال به سرور';
              }
              initializeLoginForm();
            });
        }
      };

      function getPasswordRecoveryUrl() {
        var splitHost = $window.location.host.split('.');
        var domain = splitHost[1];
        domain += splitHost[2] ? '.' + splitHost[2] : '';
        return 'http://' + domain + '/password/recovery/';
      }

      angular.element(document).ready(function () {
        initializeLoginForm();
      });

      var initializeLoginForm = function () {
        $scope.forms.login.$setPristine();
        $scope.password = '';
      };
    }
  ]);
