'use strict';

var app = angular.module('LoginApp', ['ngStorage', 'angular-jwt'])
  .controller('LoginController', ['$scope', '$interval', '$location', 'AuthService',
    function ($scope, $interval, $location, AuthService) {

      $scope.circles = [];

      function login() {
        console.log('login called...');
        var isFormValid = $scope.forms.login.username.$valid && $scope.forms.login.password.$valid;
        if (isFormValid) {
          AuthService.login($scope.forms.login.username, $scope.forms.login.password)
            .then(function () {
              $location.url('/messenger');
            }).catch(function () {
              // TODO: Handle error or show message to user.
            });
        }
      }

      function generateCircle(top, left, r, opacity, blur, speedX, speedY, speedBlur) {
        return {
          top: top,
          left: left,
          r: r,
          opacity: opacity,
          blur: blur,
          speedX: speedX || (Math.random() * 2 - 1),
          speedY: speedY || (Math.random() * 2 - 1),
          speedBlur: speedBlur || Math.random() * 0.01,
          style: {
            "position": "absolute",
            "top": top + "px",
            "left": left + "px",
            "width": 2 * r + "px",
            "height": 2 * r + "px",
            "border-radius": 2 * r + "px",
            "background-color": "white",
            "opacity": opacity,
            "filter": "blur(" + blur + "px)"
          }
        };
      }

      var counter = 0;

      function updateScreen() {
        counter++;
        for (var i = 0; i < 15; i++) {
          $scope.circles[i].left = $scope.circles[i].left + $scope.circles[i].speedX;
          $scope.circles[i].top = $scope.circles[i].top + $scope.circles[i].speedY;
          //$scope.circles[i].opacity = $scope.circles[i].opacity+$scope.circles[i].speedBlur;
          //$scope.circles[i].blur = $scope.circles[i].blur+$scope.circles[i].speedBlur*200;
          $scope.circles[i] = generateCircle($scope.circles[i].top,
            $scope.circles[i].left, $scope.circles[i].r, $scope.circles[i].opacity,
            $scope.circles[i].blur, $scope.circles[i].speedX, $scope.circles[i].speedY,
            $scope.circles[i].speedBlur);
        }
      }

      $interval(updateScreen, 100);

      for (var j = 0; j < 15; j++) {
        var param = Math.random();
        var left = Math.random() * 1024;
        var top = Math.random() * 768;
        var r = 5 + param * 130;
        var opacity = Math.max((1 - param), 0.1);
        var blur = Math.max((1 - param) * 22, 5);
        var circle = generateCircle(top, left, r, opacity, blur);
        $scope.circles.push(circle);
      }

    }
  ]);
