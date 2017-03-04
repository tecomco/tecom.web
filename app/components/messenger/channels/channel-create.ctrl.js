'use strict';

app.controller('createChannelController', ['$uibModalInstance', '$log',
  'channelsService', 'User', 'Channel', 'ArrayUtil',
  function ($uibModalInstance, $log, channelsService, User, Channel,
            ArrayUtil) {
    var self = this;

    self.forms = {};
    self.newChannel = {};

    self.teamMembers = [];
    var selectedMembers = [];

    var makeSelectedMembersArray = function () {
      selectedMembers = [];
      selectedMembers.push(User.getCurrent().memberId.toString());
      for (var i = 0; i < self.teamMembers.length; i++) {
        if (self.teamMembers[i].selected === true)
          selectedMembers.push(self.teamMembers[i].id.toString());
      }
    };

    self.formNameCheckEmpty = function (form) {
      return ((form.name.$touched || form.$submitted) && (!form.name.$viewValue));
    };

    self.formNameCheckMax = function (form) {
      return (form.name.$viewValue && form.name.$invalid);
    };


    self.closeCreateChannel = function () {
      $uibModalInstance.close();
    };

    self.createChannelSubmit = function () {
      self.newChannel.serverError = false;
      if (self.forms.newChannelForm.$valid === true) {
        sendNewChannelData();
      }
    };

    var sendNewChannelData = function () {
      makeSelectedMembersArray();
      var newChannelType = self.newChannel.isPrivate ?
        Channel.TYPE.PRIVATE : Channel.TYPE.PUBLIC;
      var newChannelData = {
        name: self.newChannel.name,
        description: self.newChannel.description,
        type: newChannelType,
        member_ids: selectedMembers,
        creator: User.getCurrent().memberId,
        team: User.getCurrent().team.id
      };
      channelsService.createChannel(newChannelData)
        .then(function () {
          self.closeCreateChannel();
        })
        .catch(function (err) {
          if (err.indexOf('Duplicate slug in team.') != -1) {
            $log.error('Error Creating new Channel:', err);
            self.newChannel.dublicateError = true;
          } else {
            self.newChannel.serverError = true;
          }
        });
    };

    function makeTeamMembersArray() {
      User.getCurrent().team.members.forEach(function (member) {
        self.teamMembers.push(member);
      });
      ArrayUtil.removeElementByKeyValue(self.teamMembers,
        'id', User.getCurrent().memberId);
    }

    angular.element(document).ready(function () {
      initializeNewChannelForm();
    });

    var initializeNewChannelForm = function () {
      self.newChannel.name = '';
      self.newChannel.description = '';
      self.newChannel.isPrivate = false;
      self.newChannel.dublicateError = false;
      self.newChannel.serverError = false;
      self.forms.newChannelForm.$setPristine();
      makeTeamMembersArray();
    };
  }
]);
