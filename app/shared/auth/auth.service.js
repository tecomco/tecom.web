'use strict';

app.factory('AuthService', ['$log', '$http', '$q', 'jwtHelper', 'User',
  function ($log, $http, $q, jwtHelper, User) {
    var loginError = false;
    function createUser(token) {
      var decodedToken = jwtHelper.decodeToken(token);
      // TODO: Get current membership properly.
      var currentMembership = decodedToken.memberships[0];
      var user = new User(currentMembership.id, currentMembership.username,
        decodedToken.username, currentMembership.team_id, null, token);
      return user.save();
    }

    function login(username, password, teamName) {
      var defer = $q.defer();
      var data = {
        username: username,
        password: password,
        team: teamName
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
      }).catch(function(e){
        $log.err('Login Error:', e);
        loginError = true;
      });

      return defer.promise;
    }

    function refreshToken(token) {
      var data = {
        token: token
      };
      $http({
        method: 'POST',
        url: '/api/v1/auth/token/refresh/',
        data: data
      }).then(function (response) {
        $log.info('Response:', response);
        var token = response.data.token;
        if (token) {
          createUser(token);
        }
      });
    }

    var setLoginError = function (errorFlag) {
      loginError = errorFlag;
    }

    return {
      login: login,
      refreshToken: refreshToken,
      setLoginError: setLoginError
    };
  }
]);
