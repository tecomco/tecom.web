'use strict';

app.factory('teamService', ['socket', 'User', function (socket, User) {

  socket.on('member:new', function (member) {
    User.getCurrent().team.members.push(member);
  });

  return {};

}]).run(['teamService', function (teamService) {
}]);