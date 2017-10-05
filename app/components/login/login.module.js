'use strict';

var app = angular.module('LoginApp', [
    'ui.router', 'ngStorage', 'angular-jwt', 'ismobile', 'config'
  ])
  .config(['$httpProvider', 'ENV',
    function ($httpProvider, ENV) {
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
  ])
  .config(['$locationProvider', 'ENV', function ($locationProvider, ENV) {
    if (ENV.isWeb)
      $locationProvider.html5Mode(true);
  }])
  .config(['$stateProvider', '$urlRouterProvider', 'isMobileProvider', 'ENV',
    function ($stateProvider, $urlRouterProvider, isMobile, ENV) {
      $urlRouterProvider.otherwise('/login');
      $stateProvider
        .state('login', {
          url: '/login',
          views: {
            '': {
              templateUrl: ENV.isWeb ?
                'app/components/login/login-form.html?v=1.0.3' : 'login-form.html?v=1.0.3'
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
        })
        .state('findTeam', {
          url: '/login',
          views: {
            '': {
              templateUrl: ENV.isWeb ?
                'app/components/login/find-team.electron.html' : 'find-team.electron.html'
            }
          }
        });
    }
  ])
  .controller('loginController', [
    '$scope', '$log', '$window', '$state', '$location', '$http',
    '$localStorage', 'AuthService', 'ENV',
    function ($scope, $log, $window, $state, $location, $http, $localStorage,
      AuthService, ENV) {
      $scope.hasLoginError = false;
      $scope.submitClicked = false;
      $scope.isLoading = false;

      $scope.passwordRecoveryUrl = getPasswordRecoveryUrl();
      $scope.redirectError = getRedirectError();

      loginIfTokenAvailable();
      if (!ENV.isWeb)
        checkStorageForTeamSlug();

      $scope.login = function () {
        var isFormNotEmpty = $scope.forms.login.email.$valid &&
          $scope.forms.login.password.$valid;
        if (isFormNotEmpty) {
          $scope.isLoading = true;
          AuthService.login($scope.email, $scope.password)
            .then(function () {
              if (ENV.isWeb)
                $window.location.assign('/messenger');
              else
                $window.location.assign('../../../index.electron.html');
            })
            .catch(function (err) {
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
                  $scope.loginErrorString =
                  'نام کاربری یا رمزعبور صحیح نمی باشد.';
                else
                  $scope.loginErrorString = 'خطا در اتصال به سرور';
              }
              initializeLoginForm();
            });
        }
      };

      $scope.gotoFindTeam = function () {
        delete $localStorage.teamSlug;
        if (ENV.isWeb)
          $window.location.href = 'http://tecom.me/teams/find';
        else
          $state.go('findTeam');
      };

      $scope.getTecomBigLogoUrl = function () {
        if (ENV.isWeb)
          return 'static/img/tecom-logo-big.png';
        else
          return '../../../static/img/tecom-logo-big.png';
      };

      function loginIfTokenAvailable() {
        var token = $location.search().token;
        if (token) {
          $localStorage.token = token;
          $window.location.assign('/messenger');
        }
      }

      function checkStorageForTeamSlug() {
        var teamSlug = $localStorage.teamSlug;
        if (teamSlug) {
          AuthService.teamExists(teamSlug)
            .then(function () {
              checkStorageForToken();
            })
            .catch(function () {
              $state.go('findTeam');
            });
        } else
          $state.go('findTeam');
      }

      function checkStorageForToken() {
        var token = $localStorage.token;
        if (token) {
          AuthService.isAuthenticated(token)
            .then(function () {
              $window.location.assign('../../../index.electron.html');
            })
            .catch(function () {
              initializeLoginForm();
            });
        } else
          initializeLoginForm();
      }

      if (ENV.isWeb)
        angular.element(document).ready(function () {
          initializeLoginForm();
        });

      function getPasswordRecoveryUrl() {
        var splitHost = $window.location.host.split('.');
        var domain = splitHost[1];
        domain += splitHost[2] ? '.' + splitHost[2] : '';
        return 'http://' + domain + '/password/recovery/';
      }

      function getRedirectError() {
        var error = $location.search().err;
        switch (error) {
          case 'InvalidToken':
            return 'متاسفانه محتوای Token شما نامعتبر است، لطفا دوباره وارد شوید.';
          case 'UserRemoved':
            return 'شما توسط یکی از ادمین‌ها از تیم حذف شدید!';
          default:
            return null;
        }
      }

      var initializeLoginForm = function () {
        $scope.forms.login.$setPristine();
        $scope.password = '';
        document.getElementById('email').focus();
      };
    }
  ])
  .controller('findTeamCtrl', [
    '$scope', '$localStorage', '$window', '$timeout', 'AuthService',
    function ($scope, $localStorage, $window, $timeout, AuthService) {
      $scope.findTeam = function () {
        AuthService.teamExists($scope.teamSlug)
          .then(function () {
            $localStorage.teamSlug = $scope.teamSlug;
            $window.location.assign('login.electron.html');
          })
          .catch(function () {
            $scope.teamNotFound = true;
            $timeout(function () {
              $scope.teamNotFound = false;
            }, 3000);
          });
      };

    }
  ]);
