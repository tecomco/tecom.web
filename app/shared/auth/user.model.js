'use strict';

app.factory('User', ['Team', function (Team) {

    function User(id, username, email, teamId, image, isAdmin) {
      this.id = id;
      this.username = username;
      this.email = email;
      this.team = new Team(teamId);
      this.image = 'http://images.dujour.com/wp-content/uploads/assets/media/2859_a226e450e214f350856e2980b6e55ac9-853x1024.jpg';
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
