'use strict';

app.factory('Team', ['$http', '$q', '$log', '$localStorage', 'ArrayUtil',
  function ($http, $q, $log, $localStorage, ArrayUtil) {

    function Team(id) {
      this.id = id;
      this.members = [];
      var that = this;
      this.areMembersReady = false;
      this.membersPromise = this.getTeamMembers();
      this.getName()
        .success(function (res) {
          that.name = res.name;
        });
    }

    Team.prototype.getTeamMembers = function () {
      var that = this;
      var deferred = $q.defer();
      $http({
        method: 'GET',
        url: '/api/v1/teams/' + this.id + '/members/',
        headers: {
          'Authorization': 'JWT ' + $localStorage.token
        }
      }).success(function (res) {
        that.members = res;
        that.areMembersReady = true;
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
      if (userId === Team.TECOM_BOT.id) {
        return Team.TECOM_BOT.username;
      }
      var index = ArrayUtil.getIndexByKeyValue(this.members, 'id', userId);
      if (index !== -1)
        return this.members[index].username;
      else {
        return '';
      }
    };

    Team.prototype.getMemberByUsername = function (username) {
      if (username === Team.TECOM_BOT.username) {
        return Team.TECOM_BOT;
      }
      var index = ArrayUtil.getIndexByKeyValue(this.members, 'username', username);
      if (index !== -1)
        return this.members[index];
      else {
        $log.error('Member Not Found !');
        return null;
      }
    };

    Team.prototype.getMemberById = function (id) {
      if (id === Team.TECOM_BOT.id) {
        return Team.TECOM_BOT;
      }
      var index = ArrayUtil.getIndexByKeyValue(this.members, 'id', id);
      if (index !== -1)
        return this.members[index];
      else {
        $log.error('Member Not Found !');
        return null;
      }
    };

    Team.prototype.getActiveMembers = function () {
      var activeMembers = this.members.filter(function (member) {
        return member.active === true;
      });
      return activeMembers;
    };

    Team.prototype.isDirectActive = function(username){
      var member = this.getMemberByUsername(username);
      if(member) {
        if(member.id === Team.TECOM_BOT.id)
          return true;
        return member.active;
      }
    };

    Team.TECOM_BOT = {
      id: 0,
      username: 'تیک-بات'
    };

    return Team;
  }
]);
