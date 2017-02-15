'use strict';

app.factory('User', ['Team', function (Team) {

    function User(id, username, email, teamId, memberId, image, isAdmin) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.memberId = memberId;
      this.team = new Team(teamId);
      this.image = image || '/static/img/user-def.png';
      this.isAdmin = isAdmin;
    }

    var self = this;

    function setCurrent(id, username, email, teamId, image, isAdmin) {
      self.currentUser = new User(id, username, email, teamId, image, isAdmin);
    }

    function getCurrent() {
      return self.currentUser;
    }

    return {
      setCurrent: setCurrent,
      getCurrent: getCurrent
    };

  }
]);
