'use strict';

app.factory('Team', ['$http', '$log', 'arrayUtil',
  function ($http, $log, arrayUtil) {

    function Team(id, token) {
      this.id = id;
      this.bindMembersFromServer(token);
    }

    Team.prototype.bindMembersFromServer = function (token) {
      var that = this;
      $http({
        method: 'GET',
        url: '/api/v1/teams/' + this.id + '/members/',
        headers: {
          'Authorization': 'JWT ' + token
        }
      }).then(function (res) {
        that.members = res.data;
      }).catch(function (err) {
        $log.info('Error getting team members.', err);
      });
    };

    Team.prototype.getUserById = function (userId) {
      if (!this.members)
        return 'Loading...';
      var index = arrayUtil.getIndexByKeyValue(this.members, 'id', userId);
      console.log('username:', this.members[index].username);
      return (index === -1) ? this.members[index].username : null;
    };

    return Team;

  }
]);
