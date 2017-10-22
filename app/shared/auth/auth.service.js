'use strict';

app.factory('AuthService', [
  '$log', '$http', '$q', '$window', '$timeout', '$localStorage', 'jwtHelper',
  'ArrayUtil', 'CurrentMember', '$injector', 'domainUtil', 'validationUtil',
  '$rootElement', 'ENV',
  function ($log, $http, $q, $window, $timeout, $localStorage, jwtHelper,
    ArrayUtil, CurrentMember, $injector, domainUtil, validationUtil,
    $rootElement, ENV) {

    var Team;
    if ($rootElement.attr('ng-app') === 'tecomApp') {
      Team = $injector.get('Team');
      initialize();
    }

    function initialize() {
      var token = $localStorage.token;
      var teamSlug = domainUtil.getSubdomain();
      createUser(token, teamSlug);
    }

    function createUser(token, teamSlug) {
      var decodedToken = jwtHelper.decodeToken(token);
      var currentMembership = ArrayUtil.getElementByKeyValue(
        decodedToken.memberships, 'team_slug', teamSlug);
      CurrentMember.initialize(currentMembership.id, currentMembership.is_admin,
        decodedToken.user_id, decodedToken.username, decodedToken.email,
        decodedToken.image);
      Team.initialize(currentMembership.team_id);
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
          url: ENV.apiUri + '/api/v1/auth/login/',
          data: data,
          skipAuthorization: true
        })
        .then(function (response) {
          var token = response.data.token;
          if (token) {
            persistToken(token);
            defer.resolve();
          } else {
            defer.reject();
          }
        })
        .catch(function (err) {
          defer.reject(err);
        });
      return defer.promise;
    }

    function logout(errAddress) {
      $http.post(ENV.apiUri + '/api/v1/auth/logout/')
        .then(function (res) {
          $log.info(res);
          redirectToLogin(errAddress);
        })
        .catch(function (err) {
          $log.info('Logout error.', err);
        });
    }

    function redirectToLogin(errAddress) {
      delete $localStorage.token;
      var errQuery = errAddress ? '?err=' + errAddress : '';
      if (ENV.isWeb)
        $window.location.assign('/login' + errQuery);
      else
        $window.location.assign(
          'app/components/login/login.electron.html' + errQuery);
    }

    function teamExists(slug) {
      var defer = $q.defer();
      $http.get(ENV.apiUri + '/api/v1/teams/' + slug + '/exists')
        .then(function (res) {
          if (res.data.team_exists) {
            defer.resolve();
          } else {
            defer.reject();
          }
        })
        .catch(function (err) {
          $log.info('Checking team exists failed.', err);
          defer.reject();
        });
      return defer.promise;
    }

    function isAuthenticated(token) {
      var defer = $q.defer();
      $http({
          method: 'GET',
          url: ENV.apiUri + '/api/v1/auth/is_authenticated',
          headers: {
            'Authorization': 'JWT ' + token
          }
        })
        .then(function (res) {
          if (res.data.is_authenticated) {
            defer.resolve();
          } else {
            defer.reject();
          }
        })
        .catch(function (err) {
          $log.info('Checking team exists failed.', err);
          defer.reject();
        });
      return defer.promise;
    }

    return {
      initialize: initialize,
      createUser: createUser,
      login: login,
      logout: logout,
      teamExists: teamExists,
      isAuthenticated: isAuthenticated
    };
  }
]);
