'use strict';

app.factory('teamService', [
  '$rootScope', '$window', 'socket', 'Team', 'ArrayUtil',
  'channelsService', 'AuthService', 'Channel', 'Member', 'CurrentMember',
  function ($rootScope, $window, socket, Team, ArrayUtil, channelsService,
    AuthService, Channel, Member, CurrentMember) {

    socket.on('member:new', function (memberData) {
      var member = new Member(memberData.id, memberData.isAdmin,
        memberData.user_id, memberData.username, memberData.email,
        memberData.image, Member.STATUS.ONLINE);
      Team.members.push(member);
      channelsService.createAndPushChannel({
        name: member.user.username,
        slug: member.user.username,
        type: Channel.TYPE.DIRECT,
        memberId: member.id,
        isFakeDirect: true
      });
      $rootScope.$broadcast('channels:updated');
    });

    socket.on('member:remove', function (memberId) {
      if (memberId === CurrentMember.member.id) {
        AuthService.logout()
          .then(function () {
            $window.location.assign('/login?err=UserRemoved');
          });
      } else {
        deactiveTeamMember(memberId);
        var username = Team.getUsernameByMemberId(memberId);
        channelsService.setDirectActiveState(username, false);
        $rootScope.$broadcast('channels:updated');
        $rootScope.$broadcast('members:updated');
      }
    });

    socket.on('member:status:change', function (data) {
      var member = Team.getMemberByMemberId(data.memberId);
      member.status = data.status;
    });

    function deactiveTeamMember(memberId) {
      var member = Team.getMemberByMemberId(memberId);
      if (member)
        member.status = Member.STATUS.DEACTIVE;
    }

    return {
      deactiveTeamMember: deactiveTeamMember,
    };

  }
]).run(['teamService', function (teamService) {}]);
