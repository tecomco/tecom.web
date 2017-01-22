'use strict';

app.controller('createChannelController', ['$uibModalInstance', '$log',
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
      selectedMembers.push(User.id.toString());
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

    channelsService.getTeamMembers(User.team.id).then(function (members) {
      $ctrl.teamMembers = members;
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
        creator: User.id,
        team: User.team.id
      };
      channelsService.createChannel(newChannelData)
        .then(function () {
          $ctrl.closeCreateChannel();
        })
        .catch(function (err) {
          if (err.indexOf('Duplicate slug in team.') != -1) {
            $ctrl.newChannel.dublicateError = true;
          } else {
            $ctrl.newChannel.serverError = true;
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
