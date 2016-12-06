'use strict';

app.factory('User', ['$localStorage', '$q', 'Team',
  function ($localStorage, $q, Team) {

    function User(id, username, email, teamId, teamMembers, token) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.token = token;
      this.team = new Team(teamId, teamMembers, token);
    }

    User.exists = function (that) {
      var self = that || this;
      return self instanceof User;
    };

    User.prototype.exists = function () {
      return this.constructor.exists(this);
    };

    User.prototype.save = function () {
      var that = this;
      var defered = $q.defer();
      this.team.members.then(function (teamMembers) {
        $localStorage.user = {
          id: that.id,
          username: that.username,
          email: that.email,
          teamId: that.team.id,
          teamMembers: teamMembers,
          token: that.token
        };
        defered.resolve();
      });
      return defered.promise;
    };

    var currentUser = $localStorage.user;
    if (currentUser) {
      return new User(currentUser.id, currentUser.username, currentUser.email,
        currentUser.teamId, currentUser.teamMembers, currentUser.token);
    } else {
      return User;
    }

  }
]).config(function (UserProvider) {
  UserProvider.$get();
});
