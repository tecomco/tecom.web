'use strict';

app.factory('AuthService', [
  '$log', '$http', '$q', '$window', '$localStorage', 'jwtHelper', 'ArrayUtil',
  'User', 'domainUtil',
  function ($log, $http, $q, $window, $localStorage, jwtHelper, ArrayUtil,
            User, domainUtil) {

    initialize();

    function initialize() {
      var token = $localStorage.token;
      if (token) {
        var teamSlug = domainUtil.getSubdomain();
        createUser(token, teamSlug);
      } else {
        // $window.location.assign('/login');
      }
    }

    function createUser(token, teamSlug) {
      var decodedToken = jwtHelper.decodeToken(token);
      var currentMembership = ArrayUtil.getElementByKeyValue(
        decodedToken.memberships, 'team_slug', teamSlug);
      var user = User.setCurrent(currentMembership.id, currentMembership.username,
        decodedToken.email, currentMembership.team_id, null, token,
        currentMembership.image, currentMembership.is_admin);
    }

    function persistToken(token) {
      $localStorage.token = token;
    }

    function login(email, password) {
      var defer = $q.defer();
      var data = {
        email: email,
        password: password,
        teamSlug: domainUtil.getSubdomain()
      };
      $http({
        method: 'POST',
        url: '/api/v1/auth/login',
        data: data,
        skipAuthorization: true
      }).then(function (response) {
        var token = response.data.token;
        if (token) {
          persistToken(token);
          defer.resolve();
        } else {
          defer.reject();
        }
      }).catch(function (err) {
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
      refreshToken: refreshToken
    };
  }
]);
