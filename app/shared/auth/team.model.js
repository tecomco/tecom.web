'use strict';

app.factory('Team', [
  '$http', 'socket', '$q', '$log', '$localStorage', 'ArrayUtil', 'Member',
  'CurrentMember',
  function ($http, socket, $q, $log, $localStorage, ArrayUtil, Member,
    CurrentMember) {

    function Team() {}

    Team.initialize = function (id) {
      Team.id = id;
      Team.members = [];
      Team.membersPromise = Team.getTeamMembers();
      Team.getName()
        .then(function (res) {
          Team._name = res.name;
        });
    };

    Team.getTeamMembers = function () {
      var deferred = $q.defer();
      socket.emit('team:members', null, function (res) {
        Team.members = res.map(function (memberData) {
          return new Member(memberData.id, memberData.isAdmin,
            memberData.user_id, memberData.username, memberData.email,
            memberData.image, memberData.status);
        });
        deferred.resolve();
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
      if (CurrentMember.member.isTecomBot()) return '';
      if (memberId === Member.TECOM_BOT.id) return Member.TECOM_BOT.username;
      return Team.getMemberByMemberId(memberId).user.username;
    };

    Team.getMemberByUsername = function (username) {
      if (CurrentMember.member.isTecomBot()) return null;
      if (username === Member.TECOM_BOT.username) return Member.TECOM_BOT;
      return ArrayUtil.getElementByKeyValue(Team.members, 'user.username',
        username);
    };

    Team.getMemberByMemberId = function (memberId) {
      if (CurrentMember.member.isTecomBot()) return null;
      if (memberId === Member.TECOM_BOT.id) return Member.TECOM_BOT;
      return ArrayUtil.getElementByKeyValue(Team.members, 'id', memberId);
    };

    Team.getActiveMembers = function () {
      return Team.members.filter(function (member) {
        return member.isActive();
      });
    };

    Team.isMemberActiveByUsername = function (username) {
      if (CurrentMember.member.isTecomBot()) return true;
      if (username === Member.TECOM_BOT.username) return true;
      return Team.getMemberByUsername(username).isActive();
    };

    Team.getImageByMemberId = function (memberId) {
      if (CurrentMember.member.isTecomBot()) return '/static/img/user-def.png';
      if (memberId === Member.TECOM_BOT.id) return Member.TECOM_BOT.image;
      return Team.getMemberByMemberId(memberId).user.image;
    };

    return Team;
  }
]);
