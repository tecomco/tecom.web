'use strict';

app.factory('teamService', ['socket', 'User', 'ArrayUtil',
  function (socket, User, ArrayUtil) {

    socket.on('member:new', function (member) {
      User.getCurrent().team.members.push(member);
    });

    function deactiveTeamMember(memberId) {
      var member = User.getCurrent().team.getMemberById(memberId);
      if (member)
        member.active = false;
    }

    return {
      deactiveTeamMember: deactiveTeamMember,
    };

  }]).run(['teamService', function (teamService) {
}]);