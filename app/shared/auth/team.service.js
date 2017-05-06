'use strict';

app.factory('teamService', ['$rootScope', 'socket', 'Team', 'ArrayUtil', 'channelsService', 'Channel', 'Member',
  function($rootScope, socket, Team, ArrayUtil, channelsService, Channel, Member) {

    socket.on('member:new', function(memberData) {
      memberData.active = true;
      var member = new Member(memberData.id, memberData.is_admin,
        memberData.active, memberData.user_id, memberData.username,
        memberData.email, memberData.image);
      Team.members.push(member);
      channelsService.createAndPushChannel({
        name: member.user.username,
        slug: member.user.username,
        type: Channel.TYPE.DIRECT,
        memberId: member.id
      });
      $rootScope.$broadcast('channels:updated');
    });

    function deactiveTeamMember(memberId) {
      var member = Team.getMemberByMemberId(memberId);
      if (member)
        member.active = false;
    }

    return {
      deactiveTeamMember: deactiveTeamMember,
    };

  }
]).run(['teamService', function(teamService) {}]);
