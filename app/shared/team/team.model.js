'use strict';

app.factory('Team', ['$localStorage', 'arrayUtil',
  function ($localStorage, arrayUtil) {

    function Team(teamId, teamMembers) {
      this.id = teamId;
      this.members = teamMembers;
    }

    Team.exist = function (that) {
      var self = that || this;
      return self instanceof Team;
    };

    Team.prototype.exist = function () {
      return this.constructor.exist(this);
    };

    Team.prototype.save = function () {
      $localStorage.team = {id: this.id, members: this.members};
    };

    Team.prototype.getUserById = function (userId) {
      var index = arrayUtil.getIndexByKeyValue(this.members, 'id', userId);
      return (index === -1) ? this.members[index].username : null;
    };

    if ($localStorage.team) {
      return new Team($localStorage.team.id, $localStorage.team.teamMembers);
    }
    else {
      return Team;
    }
  }]).config(function (TeamProvider) {
  TeamProvider.$get();
});