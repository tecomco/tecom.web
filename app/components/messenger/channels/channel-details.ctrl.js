'use strict';

app.controller('channelDetailsController', [
  '$scope', '$uibModalInstance', '$log', 'channelsService',
  'ArrayUtil', 'Channel', 'ChannelMemberItem', 'CurrentMember', 'Team',
  function ($scope, $uibModalInstance, $log, channelsService,
            ArrayUtil, Channel, ChannelMemberItem, CurrentMember, Team) {
    $scope.editMode = false;
    $scope.addMemberMode = false;
    $scope.channel = channelsService.getCurrentChannel();
    $scope.isMuted = $scope.channel.isMuted;
    $scope.isAdmin = CurrentMember.member.isAdmin;
    $scope.details = {};
    $scope.forms = {};
    $scope.serverError = false;
    $scope.channeMemberItems = [];
    var channelData;

    $scope.editChannelClick = function () {
      $scope.editMode = true;
      $scope.serverError = false;
      channelData = channelsService.getCurrentChannel().getChannelData();
      setDetailsFormDatas();
    };

    function setDetailsFormDatas() {
      $scope.details.name = channelData.name;
      $scope.details.description = channelData.description;
      $scope.details.isPrivate = (channelData.type === Channel.TYPE.PRIVATE);
      clearCustomErrorMessages();
    }

    $scope.submitChannelDetailsForm = function () {
      clearCustomErrorMessages();
      $scope.forms.detailsForm.$setPristine();
      var type = $scope.details.isPrivate ?
        Channel.TYPE.PRIVATE : Channel.TYPE.PUBLIC;
      var editedData = {
        name: $scope.details.name,
        description: $scope.details.description,
        type: type,
        id: $scope.channel.id
      };
      channelsService.sendEditedChannel(editedData).then(function () {
        clearCustomErrorMessages();
        $scope.editMode = false;
        $log.info('Done Editing Channel');
      }).catch(function (message) {
        if (message.indexOf('Duplicate slug in team.') != -1) {
          $scope.forms.detailsForm.name.$error.duplicate = true;
          $log.error('Error : Dublicate Slug');
        }
        else {
          $scope.serverError = true;
          $log.error('Error sending new channel form to server :',
            message);
        }
      });
    };

    angular.element(document).ready(function () {
      initializeDetailsForm();
    });

    var initializeDetailsForm = function () {
      $scope.details.duplicateError = false;
      $scope.forms.detailsForm.$setPristine();
      $scope.forms.detailsForm.$submitted = false;
      $scope.addedMemberIds = [];
      addActiveTeamMembersToChanneMemberItems();
      getChannelMembersAndAddToChanneMemberItems();
    };

    function addActiveTeamMembersToChanneMemberItems() {
      Team.getActiveMembers().forEach(function (teamMember) {
        var item = new ChannelMemberItem(teamMember.id);
        $scope.channeMemberItems.push(item);
      });
    }

    function getChannelMembersAndAddToChanneMemberItems() {
      channelsService.getChannelMembers($scope.channel.id)
        .then(function (res) {
          if (res && res.data) {
            res.data.forEach(function (channelMember) {
              var item = findChanneMemberItemById(channelMember.member);
              if (item) {
                item.setChannelMemberId(channelMember.id);
              }
            });
          }
        });
    }

    $scope.toggleisMuted = function () {
      $scope.channel.isMuted = $scope.isMuted;
      channelsService.toggleisMuted($scope.channel.id);
    };

    function findChanneMemberItemById(id) {
      var item = ArrayUtil.getElementByKeyValue($scope.channeMemberItems,
        'teamMemberId', id);
      return item;
    }

    $scope.removeMember = function (channelMember) {
      var data = {
        channelMemberId: channelMember.channelMemberId,
        memberId: channelMember.teamMemberId,
        channelId: $scope.channel.id,
        channelType: $scope.channel.type
      };
      channelsService.removeMemberFromChannel(data)
        .then(function () {
          channelMember.removeChannelMemberId();
          $log.info('Member Removed from Channel');
        }).catch(function (message) {
        $log.error('Error Removing member from channel:', message);
      });
    };

    $scope.addMembersClick = function () {
      $scope.addMemberMode = true;
      clearCustomErrorMessages();
    };

    $scope.submitAddedMembers = function () {
      clearCustomErrorMessages();
      var teamMemberIds = [];
      $scope.channeMemberItems.forEach(function (item) {
        if (item.isSelected && !item.isChannelMember()) {
          teamMemberIds.push(item.teamMemberId);
          item.setTemporaryInChannel();
        }
      });
      if (teamMemberIds.length > 0)
        sendAddedMemberIdsToServer(teamMemberIds);
      $scope.addMemberMode = false;
    };

    function sendAddedMemberIdsToServer(teamMemberIds) {
      channelsService.addMembersToChannel(teamMemberIds, $scope.channel.id)
        .then(function (channelMembersData) {
          setAddedMembersChannelIds(channelMembersData);
        })
        .catch(function () {
          $scope.serverError = true;
          removeTemporaryChannelMembers();
        });
    }

    function setAddedMembersChannelIds(channelMembersData) {
      channelMembersData.forEach(function (data) {
        var channelMember =
          ArrayUtil.getElementByKeyValue($scope.channeMemberItems,
            'teamMemberId', data.member);
        channelMember.setChannelMemberId(data.id);
      });
    }

    function removeTemporaryChannelMembers() {
      $scope.channeMemberItems.forEach(function (channelMember) {
        channelMember.removeFromTemporary();
      });
    }

    $scope.isUserAdmin = function () {
      return CurrentMember.member.isAdmin;
    };

    $scope.archiveChannel = function () {
      clearCustomErrorMessages();
      channelsService.archiveChannel($scope.channel.id)
        .then(function () {
          $scope.$close();
        })
        .catch(function () {
          $scope.serverError = true;
        });
    };

    $scope.cancelEditMode = function () {
      $scope.editMode = false;
      setDetailsFormDatas();
      clearCustomErrorMessages();
    };

    $scope.cancelAddingMembers = function () {
      $scope.addMemberMode = false;
      unselectAllChannelMemberItems();
      clearCustomErrorMessages();
    };

    function unselectAllChannelMemberItems() {
      $scope.channeMemberItems.forEach(function (item) {
        item.isSelected = false;
      });
    }

    function clearCustomErrorMessages() {
      $scope.serverError = false;
      $scope.forms.detailsForm.name.$error.duplicate = false;
    }
  }
]);
