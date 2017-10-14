'use strict';

app.factory('User', ['ENV', function (ENV) {

  function User(id, username, email, image) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.image = image ? ENV.staticUri + image : 'static/img/user-def.png';
    this.usernameColor = User.COLORS[Math.floor(Math.random() *
      User.COLORS.length)];
  }

  User.COLORS = [
    '#e53935',
    '#d81b60',
    '#8e24aa',
    '#5e35b1',
    '#3949ab',
    '#1e88e5',
    '#039be5',
    '#00acc1',
    '#00897b',
    '#43a047',
    '#7cb342',
    '#afb42b',
    '#f57f17',
    '#ff8f00',
    '#ef6c00',
    '#f4511e',
    '#6d4c41',
    '#757575',
    '#546e7a'
  ];

  return User;
}]);
