'use strict';

app.controller('channelDetailsController', ['$scope', '$uibModalInstance',
  '$log', 'channelsService', 'User', 'ArrayUtil', 'Channel',
  function ($scope, $uibModalInstance, $log, channelsService, User,
            ArrayUtil, Channel) {

    var self = this;
    var selectedMember;
    self.editMode = false;
    self.channel = channelsService.getCurrentChannel();
    $log.info('channel:', self.channel);
    self.isAdmin = true;
    self.details = {};
    self.forms = {};

    self.editChannel = function () {
      self.editMode = true;
      self.details.name = self.channel.name;
      self.details.description = self.channel.description;
      self.details.isPrivate =
        (self.channel.type === Channel.TYPE.PRIVATE) ? true : false;
      self.details.duplicateError = false;
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
      channelsService.sendEditedChannel(editedData).then(function () {
        self.closeDetailsModal();
        $log.info('Done Editing Channel');
      }).catch(function (message) {
        if (message.indexOf('Duplicate slug in team.') != -1) {
          $log.error('Error : Dublicate Slug');
          self.details.duplicateError = true;
        }
        else {
          self.details.serverError = true;
          $log.error('Error sending new channel form to server :', message);
        }
      });
    };

    angular.element(document).ready(function () {
      initializeDetailsForm();
    });

    var initializeDetailsForm = function () {
      self.editMode = false;
      self.details.duplicateError = false;
      self.details.serverError = false;
      self.forms.detailsForm.$setPristine();
      self.forms.detailsForm.$submitted = false;
      self.addingMemberActive = false;
      self.addedMemberIds = [];
      self.addedMembers = [];
    };

    var updateListItems = function () {
      self.listItems = [];
      if (!self.addingMemberActive) {
        channelsService.getChannelMembers(self.channel.id).then(function (event) {
          event.members.forEach(function (channelMember) {
            self.listItems.push(makeListItem(channelMember));
          });
        }).catch(function (err) {
          $log.info('error getting channel members :', err);
        });
      }
      else {
        User.team.getTeamMembers(User.team.id).then(function (teamMembers) {
          teamMembers.forEach(function (teamMember) {
            self.listItems.push(makeListItem(teamMember));
          });
        });

      }
    };
    updateListItems();


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
      channelsService.removeMemberFromChannel(data).then(function () {
        updateListItems();
        $log.info('Member Removed from Channel');
      }).catch(function (message) {
        $log.error('Error Removing member from channel:', message);
      });
    };

    self.pushMember = function (teamMember) {
      if (!teamMember.isChannelMember) {
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
        updateListItems();
        self.addingMemberActive = true;
      }
      else {
        submitAddedMembers();
      }
    };

    function submitAddedMembers() {
      if (self.addedMemberIds.length > 0) {
        channelsService.addMembersToChannel(self.addedMemberIds,
          self.channel.id).then(function () {
          self.addingMemberActive = false;
          self.channel.membersCount = self.channel.membersCount + self.addedMemberIds.length;
          $log.info('Done Adding members');
        }).catch(function () {
          $log.error('Error Adding members');
        });
      }
      else
        getChannelMembers();
    }

    self.getListItemCSS = function (listMember) {
      if (self.addingMemberActive) {
        if (listMember.isChannelMember)
          return {'background-color': '#CFE0F3'};
        else if (ArrayUtil.contains(self.addedMemberIds, listMember.member_id))
          return {'background-color': '#C4F3AB'};
        else
          return {'background-color': 'white'};
      }
      else
        return {'background-color': 'white'};
    };

    self.showRemoveIcon = function (member) {
      return (member.isChannelMember) &&
        (selectedMember === member && member.member_id !== User.id);
    };

    function makeListItem(member) {
      var item = {
        full_name: member.full_name,
        member_id: (member.member_id) ? member.member_id : member.id,
        image: member.image,
        username: member.username,
        isChannelMember: (member.member_id) ? true : false
      };
      return item;
    }
  }
]);
