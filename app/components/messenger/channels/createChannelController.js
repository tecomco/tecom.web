'use strict';

app.controller('createChannelController', ['$uibModalInstance', '$log', 'channelsService', '$localStorage', 'arrayUtil',
  function ($uibModalInstance, $log, channelsService, $localStorage, arrayUtil) {

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
      selectedMembers.push($localStorage.decodedToken.memberships[0].id.toString());
      for (var i = 0; i < $ctrl.teamMembers.length; i++) {
        if ($ctrl.teamMembers[i].selected === true)
          selectedMembers.push($ctrl.teamMembers[i].id.toString());
      }
    };

    $ctrl.formNameCheckEmpty = function (form) {
      return ((form.name.$touched || form.$submitted) && (!form.name.$viewValue));
    };

    $ctrl.formNameCheckMax = function (form) {
      return (form.name.$viewValue && form.name.$invalid);
    };

    channelsService.getTeamMembers($localStorage.decodedToken.memberships[0].team_id).then(function (event) {
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
      $uibModalInstance.close();
    };

    $ctrl.createChannelSubmit = function () {
      $ctrl.newChannel.serverError = false;
      if ($ctrl.forms.newChannelForm.$valid === true) {
        sendNewChannelData();
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
        creator: $localStorage.decodedToken.memberships[0].id,
        team: $localStorage.decodedToken.memberships[0].team_id
      };

      channelsService.sendNewChannel(newChannelData, function (response) {
        $log.info('New channel response: ', response);
        if (response.status) {
          $ctrl.closeCreateChannel();
        }
        else {
          if (response.message.indexOf('Duplicate slug in team.') != -1) {
            $log.error('Error : Dublicate Slug');
            $ctrl.newChannel.dublicateError = true;
          }
          else {
            $ctrl.newChannel.serverError = true;
            $log.error('Error sending new channel form to server :', response.message);
          }
        }
      });
    };

    angular.element(document).ready(function () {
      initializeNewChannelForm();
    });

    var initializeNewChannelForm = function () {
      $ctrl.newChannel.name = '';
      $ctrl.newChannel.description = '';
      $ctrl.newChannel.isPrivate = false;
      $ctrl.newChannel.dublicateError = false;
      $ctrl.newChannel.serverError = false;
      $ctrl.forms.newChannelForm.$setPristine();
    };
  }
]);
