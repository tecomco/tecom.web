'use strict';

app.controller('newDirectController', ['$uibModalInstance', '$log',
  'channelsService', 'ArrayUtil', '$state', 'CurrentMember', 'Team',
  function($uibModalInstance, $log, channelsService, ArrayUtil, $state,
    CurrentMember, Team) {

    var self = this;

    self.forms = {};
    self.teamMembers = [];

    Team.getTeamMembers().then(function(event) {
      self.teamMembers = event;
      ArrayUtil.removeElementByKeyValue(self.teamMembers, 'id',
        CurrentMember.member.id);
    }, function(status) {
      $log.info('error getting team members : ', status);
    });

    self.closeCreateChannel = function() {
      $uibModalInstance.dismiss('cancel');
    };

    self.directClick = function(direct) {
      var slug = '@' + Team.getUsernameByMemberId(direct.id);
      $state.go('messenger.messages', {
        slug: slug
      });
      self.closeCreateChannel();
    };
  }
]);
