'use strict';

app.controller('channelDetailsController', ['$uibModalInstance', '$log', 'channelInfo', 'channelsService',
  function ($uibModalInstance, $log ,channelInfo, channelsService) {

    var $ctrl = this;
    $ctrl.teamMembers = [];
    $ctrl.channelMembers = [];

    $ctrl.channel = channelInfo;
    $log.info($ctrl.channel);

    $ctrl.closeDetailsChannel = function () {
      $uibModalInstance.dismiss('cancel');
      $log.info('Channel details modal closed.');
    };

    channelsService.getTeamMembers(window.teamId).then(function (event) {
      $ctrl.teamMembers = event;
      for (var i = 0; i < $ctrl.teamMembers.length; i++) {
        $ctrl.teamMembers[i].selected = false;
      };
    }, function (status) {
      $log.info('error getting team members :');
      $log.error(status);
    });
  }
]);
