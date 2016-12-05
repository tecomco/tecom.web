'use strict';

app.factory('AuthService', ['$log', '$q', '$http', 'jwtHelper', 'User', 'Team',
  function ($log, $q, $http, jwtHelper, User, Team) {

    /* jshint loopfunc:true */
    var createUser = function (token) {
      var decodedToken = jwtHelper.decodeToken(token);
      decodedToken.memberships.forEach(function (membership) {
        var user = new User(membership.id,
          membership.username, decodedToken.username, team, token);
        user.save();
      });
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
        console.log('Token :', token);
        if (token) {
          createUser(token);
          callback(true);
        }
      });
    };

    var bindUserTeams = function (teamId) {
      var deferredMembers = $q.defer();
      $http({
        method: 'GET',
        url: '/api/v1/teams/' + teamId + '/members/'
      }).then(function (data) {
        deferredMembers.resolve(data);
      }, function (err) {
        $log.info("Error getting team members: ", err);
      });
      return deferredMembers.promise;
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
