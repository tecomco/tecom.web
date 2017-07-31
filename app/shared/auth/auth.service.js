'use strict';

app.factory('AuthService', [
  '$log', '$http', '$q', '$window', '$localStorage', 'jwtHelper',
  'ArrayUtil', 'CurrentMember', '$injector', 'domainUtil', 'validationUtil',
  '$rootElement',
  function ($log, $http, $q, $window, $localStorage, jwtHelper, ArrayUtil,
    CurrentMember, $injector, domainUtil, validationUtil, $rootElement) {

    var Team;
    if ($rootElement.attr('ng-app') === 'tecomApp') {
      Team = $injector.get('Team');
      initialize();
    }

    function initialize() {
      var deferred = $q.defer();
      var token = $localStorage.token;
      if (token) {
        var teamSlug = domainUtil.getSubdomain();
        createUser(token, teamSlug).then(function () {
          deferred.resolve();
        });
      } else {
        // $window.location.assign('/login');
      }
      return deferred.promise;
    }

    function createUser(token, teamSlug) {
      var deferred = $q.defer();
      var decodedToken = jwtHelper.decodeToken(token);
      var currentMembership = ArrayUtil.getElementByKeyValue(
        decodedToken.memberships, 'team_slug', teamSlug);
        console.log('decodedToken',decodedToken);
        console.log('currentMembership',currentMembership);
      CurrentMember.initialize(currentMembership.id, currentMembership.is_admin,
        decodedToken.user_id, decodedToken.username, decodedToken.email,
        decodedToken.image);
        deferred.resolve();
      Team.initialize(currentMembership.team_id);
      return deferred.promise;
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
      if (validationUtil.validateEmail(usernameOrEmail))
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
      createUser: createUser,
      login: login,
      logout: logout,
    };
  }
]);
