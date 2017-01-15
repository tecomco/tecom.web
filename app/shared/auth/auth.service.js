'use strict';

app.factory('AuthService', ['$log', '$http', '$q', 'jwtHelper', 'User',
  function ($log, $http, $q, jwtHelper, User) {
    var self = this;
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
        $log.error('Login Error:', e);
        self.callbackLoginError(true);
      });

      return defer.promise;
    }

    function logout() {
      var defer = $q.defer();
      $http.post('/api/v1/auth/logout/')
        .then(function (res) {
          $log.info(res);
          defer.resolve();
        })
        .catch(function (err) {
          $log.info('Logout error.', err);
          defer.reject();
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

    var setLoginErrorCallback = function (setLoginFunc) {
      self.callbackLoginError = setLoginFunc;
    };

    return {
      login: login,
      logout: logout,
      refreshToken: refreshToken,
      setLoginErrorCallback: setLoginErrorCallback
    };
  }
]);
