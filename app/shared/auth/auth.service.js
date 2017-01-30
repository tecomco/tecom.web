'use strict';

app.factory('AuthService', [
  '$log', '$http', '$q', 'jwtHelper', 'ArrayUtil', 'User',
  function ($log, $http, $q, jwtHelper, ArrayUtil, User) {

    function createUser(token, teamSlug) {
      var decodedToken = jwtHelper.decodeToken(token);
      var currentMembership = ArrayUtil.getElementByKeyValue(
        decodedToken.memberships, 'team_slug', teamSlug);
      var user = new User(currentMembership.id, currentMembership.username,
        decodedToken.username, currentMembership.team_id, null, token);
      return user.save();
    }

    function login(username, password, teamSlug) {
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
          createUser(token, teamSlug)
            .then(function () {
              defer.resolve();
            })
            .catch(function () {
              defer.reject();
            });
        } else {
          defer.reject();
        }
      }).catch(function(err){
        defer.reject(err);
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

    return {
      login: login,
      logout: logout,
      refreshToken: refreshToken,
    };
  }
]);
