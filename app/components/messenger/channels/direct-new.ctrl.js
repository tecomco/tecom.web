'use strict';

app.controller('newDirectController', ['$uibModalInstance', '$log',
  'channelsService', 'ArrayUtil', 'User', '$state',
  function ($uibModalInstance, $log, channelsService, ArrayUtil, User, $state) {

    var self = this;

    self.forms = {};
    self.teamMembers = [];

    User.team.getTeamMembers(User.team.id).then(function (event) {
      self.teamMembers = event;
      ArrayUtil.removeElementByKeyValue(self.teamMembers, 'id', window.memberId);
      for (var i = 0; i < self.teamMembers.length; i++) {
        self.teamMembers[i].selected = false;
      }
    }, function (status) {
      $log.info('error getting team members : ', status);
    });

    self.closeCreateChannel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    self.directClick = function (direct) {
      $log.info('salam:', direct);
      $state.go('messenger.messages', {
        slug: direct.getUrlifiedSlug()
      });
    };
  }
]);
