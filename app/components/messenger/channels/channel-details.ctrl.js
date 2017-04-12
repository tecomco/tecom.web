'use strict';

app.controller('channelDetailsController', ['$scope', '$state',
  '$uibModalInstance', '$log', 'channelsService', 'User', 'ArrayUtil',
  'Channel',
  function ($scope, $state, $uibModalInstance, $log, channelsService, User,
            ArrayUtil, Channel) {

    var self = this;
    var selectedMember;
    self.editMode = false;
    self.channel = channelsService.getCurrentChannel();
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
        self.editMode = false;
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
      if (!self.addingMemberActive) {
        self.listItems = [];
        self.channelMembers = [];
        channelsService.getChannelMembers(self.channel.id).then(function (event) {
          event.members.forEach(function (channelMember) {
            var item = makeListItem(channelMember);
            self.listItems.push(item);
            self.channelMembers.push(item);
          });
        }).catch(function (err) {
        });
      }
      else {
        User.getCurrent().team.getTeamMembers().then(function (teamMembers) {
          teamMembers.forEach(function (teamMember) {
            if (!self.channelMembers.find(function (member) {
                return member.member_id === teamMember.id;
              }))
              self.listItems.push(makeListItem(teamMember));
          });
        });

      }
    };
    updateListItems();

    self.deleteMember = function (member) {
      var data = {
        channelMemberId: member.channelMemberId,
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
            return member === teamMember.member_id;
          })) {
          self.addedMemberIds.push(teamMember.member_id);
          teamMember.isMemberSelected = true;
        }
        else {
          ArrayUtil.removeElementByValue(self.addedMemberIds, teamMember.member_id);
          teamMember.isMemberSelected = false;
        }
      }
    };

    self.addMembersClick = function () {
      if (self.addingMemberActive === false) {
        self.addingMemberActive = true;
        updateListItems();
      }
      else {
        self.addingMemberActive = false;
        submitAddedMembers();
      }
    };

    function submitAddedMembers() {
      if (self.addedMemberIds.length > 0) {
        self.addingMemberActive = false;
        channelsService.addMembersToChannel(self.addedMemberIds,
          self.channel.id).then(function () {
          updateListItems();
          self.addedMemberIds = [];
          $log.info('Done Adding members');
        }).catch(function () {
          updateListItems();
          self.addedMemberIds = [];
          $log.error('Error Adding members');
        });
      }
      else
        updateListItems();
    }

    self.getListItemCSS = function (listMember) {
      if (self.addingMemberActive) {
        if (listMember.isChannelMember ||
          ArrayUtil.contains(self.addedMemberIds, listMember.member_id))
          return {'background-color': 'rgba(36, 167, 114, 0.2)'};
        else
          return {'background-color': 'white'};
      }
      else
        return {'background-color': 'white'};
    };

    self.showRemoveIcon = function (member) {
      if (User.getCurrent().isAdmin && !self.addingMemberActive) {
        return member.member_id !== User.getCurrent().memberId;
      } else {
        return false;
      }
    };

    self.archiveChannel = function () {
      channelsService.archiveChannel(self.channel.id)
        .then(function () {
          self.closeDetailsModal();
        })
        .catch(function () {
          /*
          Handle Archive Channel Error;
          */
        });
    };

    self.userHasChannelArchivePermission = function(){
      return User.getCurrent().isAdmin;
    };

    function makeListItem(member) {
      var item = {
        member_id: (member.member_id) ? member.member_id : member.id,
        channelMemberId: (member.member_id) ? member.id : null,
        image: User.getCurrent().team.getImageById(member.member_id),
        username: member.username,
        isChannelMember: (member.member_id) ? true : false,
        isMemberSelected: false
      };
      return item;
    }
  }
]);
