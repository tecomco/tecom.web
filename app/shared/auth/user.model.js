'use strict';

app.factory('User', ['$localStorage', 'Team', function ($localStorage, Team) {

  function User(id, username, email, teamId, token) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.token = token;
    this.team = new Team(teamId, token);
  }

  User.exists = function (that) {
    var self = that || this;
    return self instanceof User;
  };

  User.prototype.exists = function () {
    return this.constructor.exists(this);
  };

  User.prototype.save = function () {
    $localStorage.user = {
      id: this.id,
      username: this.username,
      email: this.email,
      teamId: this.team.id,
      token: this.token
    };
  };

  if ($localStorage.user) {
    return new User($localStorage.user.id, $localStorage.user.username,
      $localStorage.user.email, $localStorage.user.teamId,
      $localStorage.user.token);
  } else {
    return User;
  }

}]).config(function (UserProvider) {
  UserProvider.$get();
});
