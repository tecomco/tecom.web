'use strict';

app.controller('newDirectController', ['$uibModalInstance', '$log',
  'channelsService', 'arrayUtil', 'User',
  function ($uibModalInstance, $log, channelsService, arrayUtil, User) {

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
      selectedMembers.push(window.memberId.toString());
      for (var i = 0; i < $ctrl.teamMembers.length; i++) {
        if ($ctrl.teamMembers[i].selected === true)
          selectedMembers.push($ctrl.teamMembers[i].id.toString());
      }
    };

    channelsService.getTeamMembers(User.teamId).then(function (event) {
      $ctrl.teamMembers = event;
      var ownIndex = arrayUtil.getIndexByKeyValue($ctrl.teamMembers, 'id', window.memberId);
      if (ownIndex > -1) {
        $ctrl.teamMembers.splice(ownIndex, 1);
      }
      for (var i = 0; i < $ctrl.teamMembers.length; i++) {
        $ctrl.teamMembers[i].selected = false;
      }
    }, function (status) {
      $log.info('error getting team members : ', status);
    });

    $ctrl.closeCreateChannel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    $ctrl.createChannelSubmit = function () {
      if ($ctrl.forms.newChannelForm.$valid === true) {
        sendNewChannelData();
        $uibModalInstance.close();
      }
    };

    var sendNewChannelData = function () {
      makeSelectedMembersArray();
      var newChannelType = $ctrl.newChannel.isPrivate ?
        $ctrl.channelType.PRIVATE : $ctrl.channelType.PUBLIC;
      var newChannelData = {
        name: $ctrl.newChannel.name,
        description: $ctrl.newChannel.description,
        type: newChannelType,
        member_ids: selectedMembers,
        creator: window.memberId
      };

      channelsService.sendNewChannel(newChannelData, function (response) {
        $log.info('New channel response: ' + response);
        if (response.status) {
          $ctrl.closeCreateChannel();
        } else {
          $log.error('Error sending new channel form to server : ', response.message);
          $ctrl.newChannel.serverError = true;
        }
      });
    };

    angular.element(document).ready(function () {
      initializeNewDirect();
    });

    var initializeNewDirect = function () {
      $ctrl.newChannel.serverError = false;
    };
  }
]);
