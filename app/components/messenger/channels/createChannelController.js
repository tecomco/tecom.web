'use strict';

app.controller('createChannelController', ['$uibModalInstance', '$log', 'channelsService',
  function ($uibModalInstance, $log, channelsService) {

    var $ctrl = this;

    var channelType = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };

    $ctrl.forms = {};
    $ctrl.teamMembers = [];
    var selectedMembers = [];

    var makeSelectedMembersArray = function(){
      selectedMembers = [];
      selectedMembers.push(window.memberId);
      for(var i=0; i<$ctrl.teamMembers.length;i++)
      {
        if($ctrl.teamMembers[i].selected == true)
          selectedMembers.push($ctrl.teamMembers[i].id);
      }
    };

    channelsService.getTeamMembers(window.teamId).then(function (event) {
      $ctrl.teamMembers = event;
      for(var i=0; i<$ctrl.teamMembers.length;i++)
      {
        $ctrl.teamMembers[i].selected = false;
      };
      $log.info('team members :');
      $log.info(event);
    }, function (status) {
      $log.info('error getting team members :');
      $log.error(status);
    });

    $ctrl.closeCreateChannel = function () {
      $uibModalInstance.dismiss('cancel');
      $log.info('close');
    };

    $ctrl.createChannelSubmit = function () {
      $log.info($ctrl.teamMembers);
      sendNewChannelData();
      $uibModalInstance.close();
      $log.info('New channel form submited.');
    };

    var initializeNewChannelForm = function () {
      $ctrl.newChannel.name = '';
      $ctrl.newChannel.description = '';
      $ctrl.newChannel.isPrivate = false;
      $ctrl.forms.newChannelForm.serverError = false;
      $ctrl.forms.newChannelForm.$setPristine();
      $log.info($ctrl.forms.newChannelForm);
    };

    var sendNewChannelData = function () {
      $log.info('Sending Form to Server.');
      //var newChannelType = $ctrl.newChannel.isPrivate ?
      //channelType.PRIVATE : channelType.PUBLIC;
      // var newChannelData = {
      // name: $ctrl.newChannel.name,
      // description: $ctrl.newChannel.description,
      // type: newChannelType,
      // members: '',
      // creator: 1
      // };
      makeSelectedMembersArray();
      var newChannelData = {
        name: 'mohsen',
        description: 'Salam',
        type: 1,
        members: selectedMembers,
        creator: 1
      };

      channelsService.sendNewChannel(newChannelData, function (response) {
        console.log(response);
        $log.info('New channel response: ' + response);
        if (response.status) {
          $ctrl.closeCreateChannel();
        } else {
          $log.error('Error sending new channel form to server.');
          $log.error('Error message: ' + response.message);
          //  $ctrl.forms.newChannelForm.serverError = true;
        }
      });
    };
  }
]);