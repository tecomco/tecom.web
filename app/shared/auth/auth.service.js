'use strict';

app.factory('AuthService', ['$http', 'jwtHelper', 'User',
  function ($http, jwtHelper, User) {

    var createUser = function (token) {
      var decodedToken = jwtHelper.decodeToken(token);
      var currentMembership = decodedToken.memberships[0];
      var user = new User(currentMembership.id,
        currentMembership.username, decodedToken.username,
        currentMembership.team_id, token);
      user.save();
    };

    var login = function (username, password, callback) {
      var data = {
        username: username,
        password: password
      };
      $http({
        method: 'POST',
        url: '/api/v1/auth/login/',
        data: data,
        skipAuthorization: true
      }).then(function (response) {
        var token = response.data.token;
        if (token) {
          createUser(token);
          callback(true);
        }
      });
    };

    var refreshToken = function (token) {
      var data = {
        token: token
      };
      $http({
        method: 'POST',
        url: '/api/v1/auth/token/refresh/',
        data: data
      }).then(function (response) {
        var token = response.data.token;
        if (token) {
          createUser(token);
        }
      });
    };

    return {
      login: login,
      refreshToken: refreshToken
    };
  }
]);
