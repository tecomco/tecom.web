'use strict';

app.factory('Team', ['$http', '$q', '$log', 'arrayUtil',
  function ($http, $q, $log, arrayUtil) {

    function Team(id, members, token) {
      this.id = id;
      this.members = Array.isArray(members) ? members :
        this.getMembersFromServer(token);
    }

    Team.prototype.getMembersFromServer = function (token) {
      var that = this;
      var defered = $q.defer();
      $http({
        method: 'GET',
        url: '/api/v1/teams/' + this.id + '/members/',
        headers: {
          'Authorization': 'JWT ' + token
        }
      }).then(function (res) {
        var members = res.data;
        $log.info('Successful getting team members. length:', members.length);
        defered.resolve(members);
      }).catch(function (err) {
        $log.error('Error getting team members.', err);
        defered.reject();
      });
      return defered.promise;
    };

    Team.prototype.getUsernameById = function (userId) {
      var index = arrayUtil.getIndexByKeyValue(this.members, 'id', userId);
      return (index !== -1) ? this.members[index].username : '';
    };

    return Team;

  }
]);
