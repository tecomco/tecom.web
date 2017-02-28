'use strict';

app.factory('AuthService', [
  '$log', '$http', '$q', '$window', '$localStorage', 'jwtHelper', 'ArrayUtil',
  'User', 'domainUtil', 'validationUtil',
  function ($log, $http, $q, $window, $localStorage, jwtHelper, ArrayUtil,
            User, domainUtil, validationUtil) {

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
      var user = User.setCurrent(decodedToken.user_id, decodedToken.username,
        decodedToken.email, currentMembership.team_id, currentMembership.id,
        decodedToken.image, currentMembership.is_admin);
    }

    function persistToken(token) {
      $localStorage.token = token;
    }

    function login(usernameOrEmail, password) {
      var defer = $q.defer();
      var data = {
        password: password,
        teamSlug: domainUtil.getSubdomain()
      };
      if(validationUtil.validateEmail(usernameOrEmail))
        data.email = usernameOrEmail;
      else
        data.username = usernameOrEmail;

      $http({
        method: 'POST',
        url: '/api/v1/auth/login/',
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

    return {
      initialize: initialize,
      login: login,
      logout: logout,
    };
  }
]);
