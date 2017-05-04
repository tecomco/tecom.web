'use strict';

app.factory('teamService', ['$rootScope', 'socket', 'User', 'ArrayUtil', 'channelsService', 'Channel',
  function($rootScope, socket, User, ArrayUtil, channelsService, Channel) {

    socket.on('member:new', function(member) {
      member.active = true;
      User.getCurrent().team.members.push(member);
      channelsService.createAndPushChannel({
        name: member.username,
        slug: member.username,
        type: Channel.TYPE.DIRECT,
        memberId: member.id
      });
      $rootScope.$broadcast('channels:updated');
    });

    function deactiveTeamMember(memberId) {
      var member = User.getCurrent().team.getMemberById(memberId);
      if (member)
        member.active = false;
    }

    return {
      deactiveTeamMember: deactiveTeamMember,
    };

  }
]).run(['teamService', function(teamService) {}]);
