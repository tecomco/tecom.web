'use strict';

app.controller('channelDetailsController', ['$scope', '$uibModalInstance',
  '$log', 'channelsService', 'User', 'ArrayUtil', 'Channel', 'ChannelMemberItem',
  function ($scope, $uibModalInstance, $log, channelsService, User,
            ArrayUtil, Channel, ChannelMemberItem) {

    $scope.editMode = false;
    $scope.addMemberMode = false;
    $scope.channel = channelsService.getCurrentChannel();
    $scope.isAdmin = CurrentMember.member.isAdmin;
    $scope.details = {};
    $scope.forms = {};
    $scope.membersListItems = [];
    var channelData = channelsService.getCurrentChannel().getChannelData();

    $scope.editChannelClick = function () {
      $scope.editMode = true;
      $scope.details.name = channelData.name;
      $scope.details.description = channelData.description;
      $scope.details.isPrivate = (channelData.type === Channel.TYPE.PRIVATE);
      $scope.details.duplicateError = false;
      $scope.details.serverError = false;
    };

    $scope.submitChannelDetailsForm = function () {
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
        $scope.editMode = false;
        $log.info('Done Editing Channel');
      }).catch(function (message) {
        if (message.indexOf('Duplicate slug in team.') != -1) {
          $log.error('Error : Dublicate Slug');
          $scope.details.duplicateError = true;
        }
        else {
          $scope.details.serverError = true;
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
      $scope.details.serverError = false;
      $scope.forms.detailsForm.$setPristine();
      $scope.forms.detailsForm.$submitted = false;
      $scope.addedMemberIds = [];
      addActiveTeamMembersToMembersList();
      getChannelMembersAndAddToMembersList();
    };

    function addActiveTeamMembersToMembersList() {
      Team.getActiveMembers().forEach(function (teamMember) {
        var item = new ChannelMemberItem(teamMember.id);
        $scope.membersListItems.push(item);
      });
    }

    function getChannelMembersAndAddToMembersList() {
      channelsService.getChannelMembers($scope.channel.id)
        .then(function (res) {
          if (res && res.data) {
            res.data.forEach(function (channelMember) {
              var item = findMembersListItemById(channelMember.member);
              if (item) {
                item.setChannelMemberId(channelMember.id);
              }
            });
          }
        });
    }

    function findMembersListItemById(id) {
      var item = ArrayUtil.getElementByKeyValue($scope.membersListItems,
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
          $scope.channel.membersCount = $scope.channel.membersCount - 1;
        }).catch(function (message) {
        $log.error('Error Removing member from channel:', message);
      });
    };

    $scope.addMembersClick = function () {
      $scope.addMemberMode = !$scope.addMemberMode;
    };

    $scope.submitAddedMembers = function () {
      var teamMemberIds = [];
      $scope.membersListItems.forEach(function (item) {
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
          $scope.channel.membersCount = $scope.channel.membersCount + 1;
        })
        .catch(function () {
          removeTemporaryChannelMembers();
        });
    }

    function setAddedMembersChannelIds(channelMembersData) {
      channelMembersData.forEach(function (data) {
        var channelMember =
          ArrayUtil.getElementByKeyValue($scope.membersListItems,
            'teamMemberId', data.member);
        channelMember.setChannelMemberId(data.id);
      });
    }

    function removeTemporaryChannelMembers() {
      $scope.membersListItems.forEach(function (channelMember) {
        channelMember.removeFromTemporary();
      });
    }

    $scope.isUserAdmin = function () {
      return CurrentMember.member.isAdmin;
    };

    $scope.archiveChannel = function () {
      channelsService.archiveChannel($scope.channel.id)
        .then(function () {
          $scope.$close();
        })
        .catch(function () {
          /*
           Handle Archive Channel Error;
           */
        });
    };
  }
]);
