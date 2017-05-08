'use strict';

app.factory('teamService', [
  '$rootScope', '$window', 'socket', 'Team', 'ArrayUtil',
  'channelsService', 'AuthService', 'Channel', 'Member', 'CurrentMember',
  function ($rootScope, $window, socket, Team, ArrayUtil, channelsService,
    AuthService, Channel, Member, CurrentMember) {

    socket.on('member:new', function (memberData) {
      memberData.active = true;
      var member = new Member(memberData.id, memberData.is_admin,
        memberData.active, memberData.user_id, memberData.username,
        memberData.email, memberData.image);
      Team.members.push(member);
      $rootScope.$broadcast('members:updated');
      channelsService.createAndPushChannel({
        name: member.user.username,
        slug: member.user.username,
        type: Channel.TYPE.DIRECT,
        memberId: member.id
      });
      $rootScope.$broadcast('channels:updated');
    });

    socket.on('member:remove', function (memberId) {
      if (memberId === CurrentMember.member.id) {
        AuthService.logout()
          .then(function () {
            $window.location.assign('/login?err=UserRemoved');
          });
      }
      else {
        deactiveTeamMember(memberId);
        var username = Team.getUsernameByMemberId(memberId);
        channelsService.setDirectActiveState(username, false);
        $rootScope.$broadcast('channels:updated');
        $rootScope.$broadcast('members:updated');
      }
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
]).run(['teamService', function (teamService) {}]);
