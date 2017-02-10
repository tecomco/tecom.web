'use strict';

app.factory('Team', ['$http', '$q', '$log', '$localStorage', 'ArrayUtil',
  function ($http, $q, $log, $localStorage, ArrayUtil) {

    function Team(id) {
      this.id = id;
      this.members = [];
      var that = this;
      this.getTeamMembers()
        .then(function (members) {
          that.members = members;
        });
      this.getName()
        .success(function (res) {
          that.name = res.name;
        });
    }

    Team.prototype.getTeamMembers = function () {
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/api/v1/teams/' + this.id + '/members/',
        headers: {
          'Authorization': 'JWT ' + $localStorage.token
        }
      }).success(function (res) {
        deferred.resolve(res);
      }).error(function (err) {
        $log.error('Getting team members failed.', err);
        deferred.reject();
      });
      return deferred.promise;
    };

    Team.prototype.getName = function () {
      return $http({
        method: 'GET',
        url: '/api/v1/teams/' + this.id + '/name/',
        headers: {
          'Authorization': 'JWT ' + $localStorage.token
        }
      });
    };

    Team.prototype.getUsernameById = function (userId) {
      var index = ArrayUtil.getIndexByKeyValue(this.members, 'id', userId);
      return (index !== -1) ? this.members[index].username : '';
    };

    Team.prototype.getNameById = function (userId) {
      var index = ArrayUtil.getIndexByKeyValue(this.members, 'id', userId);
      return (index !== -1) ? this.members[index].full_name : null;
    };

    return Team;
  }
]);
