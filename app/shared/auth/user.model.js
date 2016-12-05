'use strict';

app.factory('User', ['$localStorage', function ($localStorage) {

  function User(id, username, email, team, token) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.team = team;
    this.token = token;
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
      team: this.team,
      token: this.token
    };
  };

  if ($localStorage.user) {
    return new User($localStorage.user.id, $localStorage.user.username,
      $localStorage.user.email, $localStorage.user.team,
      $localStorage.user.token);
  } else {
    return User;
  }

}]).config(function (UserProvider) {
  UserProvider.$get();
});
