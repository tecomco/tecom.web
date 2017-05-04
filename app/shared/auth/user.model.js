'use strict';

app.factory('User', function() {

  function User(id, username, email, image) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.image = image || '/static/img/user-def.png';
  }

  return User;
});
