'use strict';

app.controller('channelDetailsController', ['$uibModalInstance', '$log',
  'channelInfo', 'channelsService', 'User', 'arrayUtil', 'Channel',
  function ($uibModalInstance, $log, channelInfo, channelsService, User,
            arrayUtil, Channel) {

    var $ctrl = this;
    $ctrl.channel = channelInfo;
    var selectedChannelMember;

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
            // $ctrl.closeDetailsModal();
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
      channelsService.sendAddeMembersToChannel(addeMembers, function (response) {
        $log.info('Adding members response: ', response);
        if (response.status) {
          // $ctrl.closeDetailsModal();
          $log.info('Done Adding members');
        }
        else {
          $log.error('Error Adding members');
        }
      })
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
      $ctrl.AddingMemberActive = false;
      $ctrl.addedMemberIds = [];
    };

    channelsService.getChannelMembers($ctrl.channel.id).then(function (event) {
      $ctrl.channel = event;
    }, function (status) {
      $log.info('error getting channel members :', status);
    });

    $ctrl.hoverIn = function (channelMember) {
      selectedChannelMember = channelMember;
    };

    $ctrl.hoverOut = function () {
      selectedChannelMember = null;
    };

    $ctrl.deleteMember = function (member) {
      var data = {
        channelMemberId: member.id,
        memberId: member.member_id,
        channelId: $ctrl.channel.id,
        channelType: $ctrl.channel.type
      };
      channelsService.removeMemberFromChannel(data, function (res) {
        $log.info('Callback', res);
        if (res.status) {
          arrayUtil.removeElementByKeyValue($ctrl.channel.members, 'id', member.id);
          $log.info('Member Removed from Channel');
        }
        else
          $log.info('Error Removing member from channel:', res.message);

      });
    };

    $ctrl.pushMember = function (teamMember) {
      if (!$ctrl.addedMemberIds.find(function (member) {
          return member === teamMember.id;
        }))
        $ctrl.addedMemberIds.push(teamMember.id);
    };

    $ctrl.addMembersClick = function () {
      $ctrl.AddingMemberActive = true;
      channelsService.getTeamMembers(User.team.id).then(function (teamMembers) {
        var members = teamMembers;
        angular.forEach($ctrl.channel.members, function (channelMember) {
          arrayUtil.removeElementByKeyValue(members, 'id', channelMember.member_id);
        });
        $ctrl.teamMembers = members;
      });
    };

    $ctrl.isChannelMemberSelected = function (channelMember) {
        return (selectedChannelMember === channelMember && channelMember.member_id !== User.id);
    };
  }
])
;
