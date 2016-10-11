'use strict';

app.controller('channelDetailsController', ['$uibModalInstance', '$log',
  function ($uibModalInstance, $log) {

    var $ctrl = this;

    $ctrl.closeDetailsChannel = function () {
      $uibModalInstance.dismiss('cancel');
      $log.info('Channel details modal closed.');
    };

  }
]);
