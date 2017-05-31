'use strict';

app.factory('Team', ['$http', 'socket', '$q', '$log', '$localStorage',
  'ArrayUtil', 'Member',
  function ($http, socket, $q, $log, $localStorage, ArrayUtil, Member) {

    function Team() {}

    Team.initialize = function (id) {
      Team.id = id;
      Team.members = [];
      Team.areMembersReady = false;
      Team.membersPromise = Team.getTeamMembers();
      Team.getName()
        .success(function (res) {
          Team._name = res.name;
        });
    };

    Team.getTeamMembers = function () {
      var deferred = $q.defer();
      socket.emit('team:members', null, function (res) {
        res.forEach(function (memberData) {
          var member = new Member(memberData.id, memberData.isAdmin,
            memberData.user_id, memberData.username, memberData.email,
            memberData.image, memberData.status
          );
          Team.members.push(member);
        });
        Team.areMembersReady = true;
        deferred.resolve(res);
      });
      return deferred.promise;
    };

    Team.getName = function () {
      return $http({
        method: 'GET',
        url: '/api/v1/teams/' + Team.id + '/name/',
        headers: {
          'Authorization': 'JWT ' + $localStorage.token
        }
      });
    };

    Team.getUsernameByMemberId = function (memberId) {
      if (memberId === Member.TECOM_BOT.id) {
        return Member.TECOM_BOT.username;
      }
      var member = ArrayUtil.getElementByKeyValue(Team.members, 'id',
        memberId);
      return member ? member.user.username : '';
    };

    Team.getMemberByUsername = function (username) {
      if (username === Member.TECOM_BOT.username) {
        return Member.TECOM_BOT;
      }
      var member = ArrayUtil.getElementByKeyValue(Team.members,
        'user.username',
        username);
      if (member)
        return member;
      else {
        $log.error('Member Not Found !');
        return null;
      }
    };

    Team.getMemberByMemberId = function (memberId) {
      if (memberId === Member.TECOM_BOT.id) {
        return Member.TECOM_BOT;
      }
      var member = ArrayUtil.getElementByKeyValue(Team.members, 'id',
        memberId);
      if (!member)
        $log.error('Member Not Found !');
      return member;
    };

    Team.getActiveMembers = function () {
      return Team.members.filter(function (member) {
        return member.isActive();
      });
    };

    Team.isMemberActiveByUsername = function (username) {
      var member = Team.getMemberByUsername(username);
      if (member.id === Member.TECOM_BOT.id)
        return true;
      return member.isActive();
    };

    Team.getImageByMemberId = function (memberId) {
      var member = Team.getMemberByMemberId(memberId);
      return member.image;
    };

    return Team;
  }
]);
