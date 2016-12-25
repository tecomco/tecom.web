'use strict';

app.factory('AuthService', ['$log', '$http', '$q', 'jwtHelper', 'User',
  function ($log, $http, $q, jwtHelper, User) {

    function createUser(token) {
      var decodedToken = jwtHelper.decodeToken(token);
      // TODO: Get current membership properly.
      var currentMembership = decodedToken.memberships[0];
      var user = new User(currentMembership.id, currentMembership.username,
        decodedToken.username, currentMembership.team_id, null, token);
      return user.save();
    };

    function login(username, password) {
      var defer = $q.defer();
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
          createUser(token)
            .then(function () {
              defer.resolve();
            })
            .catch(function () {
              defer.reject();
            });
        } else {
          defer.reject();
        }
      });
      return defer;
    };

    function refreshToken(token) {
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
