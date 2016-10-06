'use strict';

app.controller('createChannelController', ['$uibModalInstance', '$log',
  function ($uibModalInstance, $log) {

    var $ctrl = this;

    $ctrl.creatChannlSubmit = function () {
      $uibModalInstance.close();
      $log.info('submit');
    };

    $ctrl.closeCreateChannel = function () {
      $log.info($uibModalInstance);
      $uibModalInstance.dismiss('cancel');
      $log.info('close');
    };

    /*$scope.createChannelSubmit = function () {
     sendNewChannelData();
     $log.info('New channel form submited.');
     };

     $scope.closeCreateChannel = function () {
     $('#createChannelModal').modal('toggle');
     $log.info('New channel modal closed.');
     };

     var initializeNewChannelForm = function () {
     $scope.newChannel.name = '';
     $scope.newChannel.description = '';
     $scope.newChannel.isPrivate = false;
     $scope.forms.newChannelForm.serverError = false;
     $scope.forms.newChannelForm.$setPristine();
     $log.info($scope.forms.newChannelForm);
     };

     var sendNewChannelData = function () {
     $log.info('Sending Form to Server.');
     var newChannelType = $scope.newChannel.isPrivate ?
     channelType.PRIVATE : channelType.PUBLIC;
     var newChannelData = {
     name: $scope.newChannel.name,
     description: $scope.newChannel.description,
     type: newChannelType,
     members: '',
     creator: 1
     };

     channelsService.sendNewChannel(newChannelData, function (response) {
     $log.info('New channel response: ' + response);
     if (response.status) {
     $scope.closeCreateChannel();
     } else {
     $log.error('Error sending new channel form to server.');
     $log.error('Error meessage: ' + response.meessage);
     $scope.forms.newChannelForm.serverError = true;
     }
     });
     };*/
  }
]);