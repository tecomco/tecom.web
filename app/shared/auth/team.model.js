'use strict';

app.factory('Team', [
  '$http', 'socket', '$q', '$log', '$localStorage', 'ArrayUtil', 'Member',
  'CurrentMember', '$rootScope',
  function ($http, socket, $q, $log, $localStorage, ArrayUtil, Member,
    CurrentMember, $rootScope) {

    function Team() {}

    Team.initialize = function (id) {
      Team.id = id;
      Team.members = [];
      Team.plan = {};
      Team.membersPromise = Team.getTeamMembers();
      Team.getTeamDataPromise = Team.getTeamData();
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

    Team.getTeamData = function () {
      var deferred = $q.defer();
      $http({
          method: 'GET',
          url: '/api/v1/teams/' + Team.id + '/',
          headers: {
            'Authorization': 'JWT ' + $localStorage.token
          }
        })
        .then(function (data) {
          $rootScope.title = 'تیم ' + data.data.name;
          Team.setTeamData(data.data);
          deferred.resolve();
        })
        .catch(function (err) {
          $log.error('Error initializing Team');
          deferred.reject();
        });
      return deferred.promise;
    };

    Team.setTeamData = function (data) {
      Team._name = data.name;
      Team.plan.name = Team.getTeamPlanName(data.current_plan.name);
      Team.plan.membersLimit = data.current_plan.team_members_limit;
      Team.plan.channelsLimit = data.current_plan.team_channels_limit;
      Team.plan.uploadLimit = data.current_plan.each_upload_storage_limit ?
        data.current_plan.each_upload_storage_limit + 'MB' :
        data.current_plan.each_upload_storage_limit;
    };

    Team.getTeamPlanName = function (planName) {
      switch (planName) {
        case 'free':
          return 'رایگان';
        case 'enterprise':
          return 'شرکتی';
      }
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
