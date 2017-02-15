'use strict';

app.controller('newDirectController', ['$uibModalInstance', '$log',
  'channelsService', 'ArrayUtil', 'User', '$state',
  function ($uibModalInstance, $log, channelsService, ArrayUtil, User, $state) {

    var self = this;

    self.forms = {};
    self.teamMembers = [];

    User.getCurrent().team.getTeamMembers().then(function (event) {
      self.teamMembers = event;
      ArrayUtil.removeElementByKeyValue(self.teamMembers, 'id', User.getCurrent().memberId);
    }, function (status) {
      $log.info('error getting team members : ', status);
    });

    self.closeCreateChannel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    self.directClick = function (direct) {
      var slug = '@' + User.getCurrent().team.getUsernameById(direct.id);
      $state.go('messenger.messages', {
        slug: slug
      });
      self.closeCreateChannel();
    };
  }
]);
