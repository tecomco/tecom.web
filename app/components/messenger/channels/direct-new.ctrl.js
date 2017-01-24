'use strict';

app.controller('newDirectController', ['$uibModalInstance', '$log',
  'channelsService', 'arrayUtil', 'User',
  function ($uibModalInstance, $log, channelsService, arrayUtil, User, Channel) {

    var self = this;

    self.forms = {};
    self.newChannel = {};
    self.teamMembers = [];
    var selectedMembers = [];

    var makeSelectedMembersArray = function () {
      selectedMembers = [];
      selectedMembers.push(window.memberId.toString());
      for (var i = 0; i < self.teamMembers.length; i++) {
        if (self.teamMembers[i].selected === true)
          selectedMembers.push(self.teamMembers[i].id.toString());
      }
    };

    User.team.getTeamMembers(User.team.id).then(function (event) {
      self.teamMembers = event;
      arrayUtil.removeElementByKeyValue(self.teamMembers, 'id', window.memberId);
      for (var i = 0; i < self.teamMembers.length; i++) {
        self.teamMembers[i].selected = false;
      }
    }, function (status) {
      $log.info('error getting team members : ', status);
    });

    self.closeCreateChannel = function () {
      $uibModalInstance.dismiss('cancel');
    };

    self.createChannelSubmit = function () {
      if (self.forms.newChannelForm.$valid === true) {
        sendNewChannelData();
        $uibModalInstance.close();
      }
    };

    var sendNewChannelData = function () {
      makeSelectedMembersArray();
      var newChannelData = {
        name: self.newChannel.name,
        description: self.newChannel.description,
        type: Channel.TYPE.DIRECT,
        member_ids: selectedMembers,
        creator: window.memberId
      };

      channelsService.sendNewChannel(newChannelData, function (response) {
        $log.info('New channel response: ' + response);
        if (response.status) {
          self.closeCreateChannel();
        } else {
          $log.error('Error sending new channel form to server : ', response.message);
          self.newChannel.serverError = true;
        }
      });
    };

    angular.element(document).ready(function () {
      initializeNewDirect();
    });

    var initializeNewDirect = function () {
      self.newChannel.serverError = false;
    };
  }
]);
