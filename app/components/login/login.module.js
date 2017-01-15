'use strict';

var app = angular.module('LoginApp', ['ui.router', 'ngStorage', 'angular-jwt'])
  .config(['$locationProvider', function ($locationProvider) {
    $locationProvider.html5Mode(true);
  }])
  .config(['$stateProvider', '$urlRouterProvider',
    function ($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/login');
      $stateProvider
        .state('login', {
          abstract: true,
          url: '/login',
          views: {
            '': {
              templateUrl: 'app/components/login/login.html'
            }
          }
        })
        .state('login.form', {
          url: '',
          templateUrl: 'app/components/login/login-form.html'
        })
        .state('login.teamNotFound', {
          url: '/not-found',
          templateUrl: 'app/components/login/team-not-found.html'
        });
    }
  ])
  .controller('LoginController', ['$scope', '$state', '$interval', '$window',
    '$http', 'domainUtil', 'AuthService', 'User', '$log',
    function ($scope, $state, $interval, $window, $http, domainUtil,
              AuthService, User, $log) {

      $scope.loginError = false;
      var setLoginError = function (bool) {
        $scope.loginError = bool;
        if($scope.loginError)
          initializeLoginForm();
      };
      AuthService.setLoginErrorCallback(setLoginError);

      if (User.exists()) {
        $window.location.assign('/messenger');
      }

      $scope.login = function () {
        var isFormValid = $scope.forms.login.username.$valid && $scope.forms.login.password.$valid;
        $log.info('isValid:', isFormValid);
        if (isFormValid) {
          AuthService.login($scope.username, $scope.password)
            .then(function () {
              $window.location.assign('/messenger');
            }).catch(function () {
            // TODO: Handle error or show message to user.
          });
        }
      };

      angular.element(document).ready(function () {
        initializeLoginForm();
      });

      var initializeLoginForm = function () {
        $log.info('start');
        $scope.forms.login.$setPristine();
        $scope.password = '';
        $scope.remember = false;
        $log.info('end');
      };

      // $scope.circles = [];
      // function generateCircle(top, left, r, opacity, blur, speedX, speedY, speedBlur) {
      //   return {
      //     top: top,
      //     left: left,
      //     r: r,
      //     opacity: opacity,
      //     blur: blur,
      //     speedX: speedX || (Math.random() * 2 - 1),
      //     speedY: speedY || (Math.random() * 2 - 1),
      //     speedBlur: speedBlur || Math.random() * 0.01,
      //     style: {
      //       "position": "absolute",
      //       "top": top + "px",
      //       "left": left + "px",
      //       "width": 2 * r + "px",
      //       "height": 2 * r + "px",
      //       "border-radius": 2 * r + "px",
      //       "background-color": "white",
      //       "opacity": opacity,
      //       "filter": "blur(" + blur + "px)",
      //       "z-index": "1"
      //     }
      //   };
      // }
      //
      // var counter = 0;
      //
      // function updateScreen() {
      //   counter++;
      //   for (var i = 0; i < 15; i++) {
      //     $scope.circles[i].left = $scope.circles[i].left + $scope.circles[i].speedX;
      //     $scope.circles[i].top = $scope.circles[i].top + $scope.circles[i].speedY;
      //     //$scope.circles[i].opacity = $scope.circles[i].opacity+$scope.circles[i].speedBlur;
      //     //$scope.circles[i].blur = $scope.circles[i].blur+$scope.circles[i].speedBlur*200;
      //     $scope.circles[i] = generateCircle($scope.circles[i].top,
      //       $scope.circles[i].left, $scope.circles[i].r, $scope.circles[i].opacity,
      //       $scope.circles[i].blur, $scope.circles[i].speedX, $scope.circles[i].speedY,
      //       $scope.circles[i].speedBlur);
      //   }
      // }
      //
      // $interval(updateScreen, 100);
      //
      // for (var j = 0; j < 15; j++) {
      //   var param = Math.random();
      //   var left = Math.random() * 1024;
      //   var top = Math.random() * 768;
      //   var r = 5 + param * 130;
      //   var opacity = Math.max((1 - param), 0.1);
      //   var blur = Math.max((1 - param) * 22, 5);
      //   var circle = generateCircle(top, left, r, opacity, blur);
      //   $scope.circles.push(circle);
      // }

    }
  ]);
