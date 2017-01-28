'use strict';

app.controller('channelDetailsController', ['$scope', '$uibModalInstance',
  '$log', 'channelsService', 'User', 'ArrayUtil', 'Channel',
  function ($scope, $uibModalInstance, $log, channelsService, User,
            ArrayUtil, Channel) {

    var self = this;
    var selectedMember;
    self.editMode = false;
    self.channel = channelsService.getCurrentChannel();
    self.isAdmin = true;
    self.details = {};
    self.forms = {};

    $log.info('channel:', self.channel);

    self.editChannel = function () {
      self.editMode = true;
      self.details.name = self.channel.name;
      self.details.description = self.channel.description;
      self.details.isPrivate =
        (self.channel.type === Channel.TYPE.PRIVATE) ? true : false;
      self.details.dublicateError = false;
      self.details.serverError = false;
    };

    self.formNameCheckEmpty = function (form) {
      return ((form.name.$touched || form.$submitted) && (!form.name.$viewValue));
    };

    self.formNameCheckMax = function (form) {
      return (form.name.$viewValue && form.name.$invalid);
    };

    self.closeDetailsModal = function () {
      $uibModalInstance.close();
    };

    self.editChannelDetailsSubmit = function () {
      self.forms.detailsForm.$setPristine();
      var type = self.details.isPrivate ?
        Channel.TYPE.PRIVATE : Channel.TYPE.PUBLIC;
      var editedData = {
        name: self.details.name,
        description: self.details.description,
        type: type,
        id: self.channel.id
      };
      channelsService.sendEditedChannel(editedData, function (response) {
          if (response.status) {
            self.closeDetailsModal();
            $log.info('Done Editing Channel');
          }
          else {
            if (response.message.indexOf('Duplicate slug in team.') != -1) {
              $log.error('Error : Dublicate Slug');
              self.details.dublicateError = true;
            }
            else {
              self.details.serverError = true;
              $log.error('Error sending new channel form to server :', response.message);
            }
          }
        }
      );
    };

    angular.element(document).ready(function () {
      initializeDetailsForm();
    });

    var initializeDetailsForm = function () {
      self.editMode = false;
      self.details.dublicateError = false;
      self.details.serverError = false;
      self.forms.detailsForm.$setPristine();
      self.forms.detailsForm.$submitted = false;
      self.addingMemberActive = false;
      self.addedMemberIds = [];
    };

    var getChannelMembers = function () {
      channelsService.getChannelMembers(self.channel.id).then(function (event) {
        self.listItems = event.members;
        self.channel.members = self.listItems;
        self.addingMemberActive = false;
      }, function (status) {
        $log.info('error getting channel members :', status);
      });
    };
    getChannelMembers();

    self.mouseHoverIn = function (channelMember) {
      selectedMember = channelMember;
    };

    self.mouseHoverOut = function () {
      selectedMember = null;
    };

    self.deleteMember = function (member) {
      var data = {
        channelMemberId: member.id,
        memberId: member.member_id,
        channelId: self.channel.id,
        channelType: self.channel.type
      };
      channelsService.removeMemberFromChannel(data, function (res) {
        if (res.status) {
          ArrayUtil.removeElementByKeyValue(self.channel.members, 'id', member.id);
          self.channel.members--;
          $log.info('Member Removed from Channel');
        }
        else
          $log.info('Error Removing member from channel:', res.message);

      });
    };

    self.pushMember = function (teamMember) {
      if (!teamMember.member_id) {
        if (!self.addedMemberIds.find(function (member) {
            return member === teamMember.id;
          }))
          self.addedMemberIds.push(teamMember.id);
        else
          ArrayUtil.removeElementByValue(self.addedMemberIds, teamMember.id);
      }
    };

    self.addMembersClick = function () {
      if (self.addingMemberActive === false) {
        User.team.getTeamMembers(User.team.id).then(function (teamMembers) {
          self.teamMembers = teamMembers;
          angular.forEach(teamMembers, function (member) {
            if (!ArrayUtil.containsKeyValue(self.listItems, 'member_id', member.id))
              self.listItems.push(member);
          });
        });
      }
      self.addingMemberActive = true;
    };

    self.addMembersSubmit = function () {
      if (self.addedMemberIds.length > 0) {
        channelsService.addMembersToChannel(self.addedMemberIds,
          self.channel.id, function (response) {
            if (response.status) {
              self.addingMemberActive = false;
              self.channel.membersCount = self.channel.membersCount + self.addedMemberIds.length;
              $log.info('Done Adding members');
            }
            else {
              $log.error('Error Adding members');
            }
          });
      }
      else
        getChannelMembers();
    };

    self.getListItemCSS = function (listMember) {
      if (self.addingMemberActive) {
        if (listMember.member_id)
          return {'background-color': '#CFE0F3'};
        else if (ArrayUtil.contains(self.addedMemberIds, listMember.id))
          return {'background-color': '#C4F3AB'};
        else
          return {'background-color': 'white'};
      }
      else
        return {'background-color': 'white'};
    };

    self.showRemoveIcon = function (member) {
      return (member.member_id) && (selectedMember === member && member.member_id !== User.id);
    };
  }
])
;
