'use strict';

app.controller('channelDetailsController', ['$scope', '$state',
  '$uibModalInstance', '$log', 'channelsService', 'User', 'ArrayUtil',
  'Channel', 'channelMemberItem',
  function ($scope, $state, $uibModalInstance, $log, channelsService, User,
            ArrayUtil, Channel, channelMemberItem) {

    var selectedMember;
    $scope.editMode = false;
    $scope.addMemberMode = false;
    $scope.channel = channelsService.getCurrentChannel();
    $scope.isAdmin = User.getCurrent().isAdmin;
    $scope.details = {};
    $scope.forms = {};
    $scope.membersListItems = [];

    $scope.editChannelClick = function () {
      $scope.editMode = true;
      $scope.details.name = $scope.channel.name;
      $scope.details.description = $scope.channel.description;
      $scope.details.isPrivate =
        ($scope.channel.type === Channel.TYPE.PRIVATE) ? true : false;
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
          $log.error('Error sending new channel form to server :', message);
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
      User.getCurrent().team.members.forEach(function (teamMember) {
        if (teamMember.active) {
          var item = new channelMemberItem(teamMember.id);
          $scope.membersListItems.push(item);
        }
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

    $scope.removeMemberClick = function (channelMember) {
      var data = {
        channelMemberId: channelMember.channelMemberId,
        memberId: channelMember.teamMemberId,
        channelId: $scope.channel.id,
        channelType: $scope.channel.type
      };
      channelsService.removeMemberFromChannel(data).then(function () {
        channelMember.removeChannelMemberId();
        $log.info('Member Removed from Channel');
      }).catch(function (message) {
        $log.error('Error Removing member from channel:', message);
      });
    };

    $scope.addMembersClick = function () {
      $scope.addMemberMode = !$scope.addMemberMode;
    };

    $scope.submitAddedMembers = function () {
      console.log('submited');
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
          console.log('Done');
        })
        .catch(function () {
          removeTemporaryChannelMembers();
          console.log('Failed');
        });
    }

    function setAddedMembersChannelIds(channelMembersData) {
      channelMembersData.forEach(function (data) {
          var channelMember =
            ArrayUtil.getElementByKeyValue($scope.membersListItems,
              'teamMemberId', data.member);
          channelMember.setChannelMemberId(data.id);
        }
      );
    }

    function removeTemporaryChannelMembers() {
      $scope.membersListItems.forEach(function (channelMember) {
        channelMember.removeFromTemporary();
      });
    }

    $scope.isUserAdmin = function () {
      return User.getCurrent().isAdmin;
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
