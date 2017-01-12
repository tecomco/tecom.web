'use strict';

app.controller('channelDetailsController', ['$scope', '$uibModalInstance', '$log',
  'channelInfo', 'channelsService', 'User', 'arrayUtil', 'Channel',
  function ($scope, $uibModalInstance, $log, channelInfo, channelsService, User,
            arrayUtil, Channel) {

    var $ctrl = this;
    $ctrl.channel = channelInfo;
    var selectedMember;
    $ctrl.editMode = false;
    $ctrl.isAdmin = true;
    $ctrl.details = {};
    $ctrl.forms = {};

    $ctrl.editChannel = function () {
      $ctrl.editMode = true;
      $ctrl.details.name = $ctrl.channel.name;
      $ctrl.details.description = $ctrl.channel.description;
      $ctrl.details.isPrivate = ($ctrl.channel.type === Channel.TYPE.PRIVATE) ? true : false;
      $ctrl.details.dublicateError = false;
      $ctrl.details.serverError = false;
    };

    $ctrl.formNameCheckEmpty = function (form) {
      return ((form.name.$touched || form.$submitted) && (!form.name.$viewValue));
    };

    $ctrl.formNameCheckMax = function (form) {
      return (form.name.$viewValue && form.name.$invalid);
    };

    $ctrl.closeDetailsModal = function () {
      $uibModalInstance.close();
    };

    $ctrl.editChannelDetailsSubmit = function () {
      $ctrl.forms.detailsForm.$setPristine();

      var type = $ctrl.details.isPrivate ?
        Channel.TYPE.PRIVATE : Channel.TYPE.PUBLIC;
      var editedData = {
        name: $ctrl.details.name,
        description: $ctrl.details.description,
        type: type,
        id: $ctrl.channel.id
      };
      var addeMembers = {
        channelId: $ctrl.channel.id,
        memberIds: $ctrl.addedMemberIds
      };
      channelsService.sendDetailsEditedChannel(editedData, function (response) {
          $log.info('Edit channel Details response: ', response);
          if (response.status) {
            $ctrl.closeDetailsModal();
            $log.info('Done Editing Channel');
          }
          else {
            if (response.message.indexOf('Duplicate slug in team.') != -1) {
              $log.error('Error : Dublicate Slug');
              $ctrl.details.dublicateError = true;
            }
            else {
              $ctrl.details.serverError = true;
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
      $ctrl.editMode = false;
      $ctrl.details.dublicateError = false;
      $ctrl.details.serverError = false;
      $ctrl.forms.detailsForm.$setPristine();
      $ctrl.forms.detailsForm.$submitted = false;
      $ctrl.addingMemberActive = false;
      $ctrl.addedMemberIds = [];
    };

    channelsService.getChannelMembers($ctrl.channel.id).then(function (event) {
      $ctrl.channel = event;
      $ctrl.listItems = $ctrl.channel.members;
      $log.info('List:', $ctrl.listItems);
    }, function (status) {
      $log.info('error getting channel members :', status);
    });

    $ctrl.hoverIn = function (channelMember) {
      selectedMember = channelMember;
    };

    $ctrl.hoverOut = function () {
      selectedMember = null;
    };

    $ctrl.deleteMember = function (member) {
      var data = {
        channelMemberId: member.id,
        memberId: member.member_id,
        channelId: $ctrl.channel.id,
        channelType: $ctrl.channel.type
      };
      channelsService.removeMemberFromChannel(data, function (res) {
        if (res.status) {
          arrayUtil.removeElementByKeyValue($ctrl.channel.members, 'id', member.id);
          $log.info('Member Removed from Channel');
        }
        else
          $log.info('Error Removing member from channel:', res.message);

      });
    };

    $ctrl.pushMember = function (teamMember) {
      if (!teamMember.member_id) {
        if (!$ctrl.addedMemberIds.find(function (member) {
            return member === teamMember.id;
          }))
          $ctrl.addedMemberIds.push(teamMember.id);
        else
          arrayUtil.removeElement($ctrl.addedMemberIds, $ctrl.addedMemberIds.indexOf(teamMember.id));
      }
    };

    $ctrl.addMembersClick = function () {
      $ctrl.addingMemberActive = true;
      channelsService.getTeamMembers(User.team.id).then(function (teamMembers) {
        $ctrl.teamMembers = teamMembers;
        angular.forEach(teamMembers, function (member) {
          if (!arrayUtil.containsKeyValue($ctrl.listItems, 'member_id', member.id))
            $ctrl.listItems.push(member);
        });
      });
    };

    $ctrl.addMembersSubmit = function () {
      if ($ctrl.addedMemberIds.length > 0) {
        channelsService.sendAddeMembersToChannel($ctrl.addedMemberIds,
          $ctrl.channel.id, function (response) {
            $log.info('Adding members response: ', response);
            if (response.status) {
              $ctrl.addingMemberActive = false;
              $log.info('Done Adding members');
            }
            else {
              $log.error('Error Adding members');
            }
          });
      }
      else
        $ctrl.addingMemberActive = false;
    };

    $ctrl.getListItemCSS = function (listMember) {
      if($ctrl.addingMemberActive) {
        if (listMember.member_id)
          return {'background-color': '#CFE0F3'};
        else if (arrayUtil.contains($ctrl.addedMemberIds, listMember.id))
          return {'background-color': '#C4F3AB'};
        else
          return {'background-color': 'white'};
      }
      else
        return {'background-color': 'white'};
    };

    $ctrl.showRemoveIcon = function (member) {
      return (member.member_id) && (selectedMember === member && member.member_id !== User.id);
    };
  }
])
;
