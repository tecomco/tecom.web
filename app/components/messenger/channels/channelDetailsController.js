'use strict';

app.controller('channelDetailsController', ['$uibModalInstance', '$log', 'channelInfo', 'channelsService',
  function ($uibModalInstance, $log, channelInfo, channelsService) {

    var $ctrl = this;

    $ctrl.editMode = false;
    $ctrl.isAdmin = true;
    $ctrl.details = {};
    $ctrl.forms = {};

    $ctrl.editChannel = function () {
      $ctrl.editMode = true;
      $ctrl.details.name = $ctrl.channel.name;
      $ctrl.details.description = $ctrl.channel.description;
      $ctrl.details.isPrivate = $ctrl.channel.isPrivate;
    };

    $ctrl.channel = channelInfo;
    $log.info($ctrl.channel);

    $ctrl.addMember = function(){
    };

    $ctrl.closeDetailsModal = function () {
      $uibModalInstance.close();
      $log.info('Channel details modal closed.');
    };

    channelsService.getChannelMembers($ctrl.channel.id).then(function (event) {
      $ctrl.channel = event;
    }, function (status) {
      $log.info('error getting channel members :', status);
    });
  }
]);
