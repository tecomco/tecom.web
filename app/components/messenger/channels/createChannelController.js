'use strict';

app.controller('createChannelController', ['$uibModalInstance', '$log', 'channelsService',
  function ($uibModalInstance, $log, channelsService) {

    var $ctrl = this;

    $ctrl.channelType = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };

    $ctrl.forms = {};
    $ctrl.newChannel = {};
    $ctrl.teamMembers = [];
    var selectedMembers = [];

    var makeSelectedMembersArray = function () {
      selectedMembers = [];
      selectedMembers.push(window.memberId);
      for (var i = 0; i < $ctrl.teamMembers.length; i++) {
        if ($ctrl.teamMembers[i].selected == true)
          selectedMembers.push($ctrl.teamMembers[i].id);
      }
    };

    $ctrl.newChannelNameCheckEmpty = function (form) {
      return ((form.name.$touched || form.$submitted) && (!form.name.$viewValue))
    };

    $ctrl.newChannelNameCheckMax = function (form) {
      return (form.name.$viewValue && form.name.$invalid)
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

    $ctrl.closeCreateChannel = function () {
      $uibModalInstance.dismiss('cancel');
      $log.info('close');
    };

    $ctrl.createChannelSubmit = function () {
      if ($ctrl.forms.newChannelForm.$valid === true) {
        sendNewChannelData();
        $uibModalInstance.close();
        $log.info('New channel form submited.');
      }
    };

    var sendNewChannelData = function () {
      $log.info('Sending Form to Server.');
      makeSelectedMembersArray();
      $log.info(selectedMembers);
      var newChannelType = $ctrl.newChannel.isPrivate ?
        $ctrl.channelType.PRIVATE : $ctrl.channelType.PUBLIC;
      var newChannelData = {
        name: $ctrl.newChannel.name,
        description: $ctrl.newChannel.description,
        type: newChannelType,
        members: selectedMembers,
        creator: window.memberId
      };

      channelsService.sendNewChannel(newChannelData, function (response) {
        console.log(response);
        $log.info('New channel response: ' + response);
        if (response.status) {
          $ctrl.closeCreateChannel();
        } else {
          $log.error('Error sending new channel form to server.');
          $log.error('Error message: ' + response.message);
          $ctrl.newChannel.serverError = true;
        }
      });
    };

    angular.element(document).ready(function () {
      initializeNewChannelForm();
    });

    var initializeNewChannelForm = function () {
      $ctrl.forms.newChannelForm.name.$viewValue = '';
      $ctrl.forms.newChannelForm.description.$viewValue = '';
      $ctrl.newChannel.isPrivate = false;
      $ctrl.newChannel.serverError = false;
      $ctrl.forms.newChannelForm.$setPristine();
    };
  }
]);
