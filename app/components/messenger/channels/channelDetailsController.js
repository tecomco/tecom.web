'use strict';

app.controller('channelDetailsController', ['$uibModalInstance', '$log', 'channelInfo', 'channelsService',
  function ($uibModalInstance, $log ,channelInfo, channelsService) {

    var $ctrl = this;

    $ctrl.editMode = false;
    $ctrl.isAdmin = true;

    $ctrl.editChannel = function(){
        $log.info("edit");
    };

    $ctrl.channel = channelInfo;
    $log.info($ctrl.channel);

    $ctrl.closeDetailsChannel = function () {
      $uibModalInstance.dismiss('cancel');
      $log.info('Channel details modal closed.');
    };

    channelsService.getChannelMembers($ctrl.channel.id).then(function(event) {
      $ctrl.channel = event;
    }, function (status) {
      $log.info('error getting channel members :' ,status);
    });
  }
]);
