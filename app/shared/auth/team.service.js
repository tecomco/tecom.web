'use strict';

app.factory('teamService', [
  '$rootScope', '$window', 'socket', 'Team', 'ArrayUtil', 'ENV',
  '$localStorage', 'channelsService', 'AuthService', 'Channel', 'Member',
  'CurrentMember',
  function ($rootScope, $window, socket, Team, ArrayUtil, ENV, $localStorage,
    channelsService, AuthService, Channel, Member, CurrentMember) {

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
            delete $localStorage.token;
            if (ENV.isWeb)
              $window.location.assign('/login?err=UserRemoved');
            else
              $window.location.assign(
                'app/components/login/login.electron.html?err=UserRemoved'
              );
            // const foo = require('electron').remote
            // foo.getCurrentWindow().loadURL(
            //   `file://${__dirname}/app/components/login/login.html?err=UserRemoved`
            // )
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
