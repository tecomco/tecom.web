'use strict';

app.controller('channelDetailsController', ['$scope', '$state',
  '$uibModalInstance', '$log', 'channelsService', 'User', 'ArrayUtil',
  'Channel',
  function ($scope, $state, $uibModalInstance, $log, channelsService, User,
            ArrayUtil, Channel) {

    var selectedMember;
    $scope.editMode = false;
    $scope.channel = channelsService.getCurrentChannel();
    $scope.isAdmin = true;
    $scope.details = {};
    $scope.forms = {};

    $scope.editChannel = function () {
      $scope.editMode = true;
      $scope.details.name = $scope.channel.name;
      $scope.details.description = $scope.channel.description;
      $scope.details.isPrivate =
        ($scope.channel.type === Channel.TYPE.PRIVATE) ? true : false;
      $scope.details.duplicateError = false;
      $scope.details.serverError = false;
    };

    $scope.formNameCheckEmpty = function (form) {
      //console.log(form.name);
      //rebturn (($scope.forms.detailsForm.name.$touched ||
      //  form.$submitted) && (!$scope.forms.detailsForm.name.$viewValue));
    };

    $scope.formNameCheckMax = function (form) {
      //return (form.name.$viewValue && form.name.$invalid);
    };

    $scope.closeDetailsModal = function () {
      $uibModalInstance.close();
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
      $scope.editMode = false;
      $scope.details.duplicateError = false;
      $scope.details.serverError = false;
      $scope.forms.detailsForm.$setPristine();
      $scope.forms.detailsForm.$submitted = false;
      $scope.addingMemberActive = false;
      $scope.addedMemberIds = [];
      $scope.addedMembers = [];
    };

    var updateListItems = function () {
      if (!$scope.addingMemberActive) {
        $scope.listItems = [];
        $scope.channelMembers = [];
        channelsService.getChannelMembers($scope.channel.id).then(function (event) {
          event.members.forEach(function (channelMember) {
            var item = makeListItem(channelMember);
            $scope.listItems.push(item);
            $scope.channelMembers.push(item);
          });
        }).catch(function (err) {
        });
      }
      else {
        User.getCurrent().team.getTeamMembers().then(function (teamMembers) {
          teamMembers.forEach(function (teamMember) {
            if (!$scope.channelMembers.find(function (member) {
                return member.member_id === teamMember.id;
              }))
              $scope.listItems.push(makeListItem(teamMember));
          });
        });

      }
    };
    updateListItems();

    $scope.deleteMember = function (member) {
      var data = {
        channelMemberId: member.channelMemberId,
        memberId: member.member_id,
        channelId: $scope.channel.id,
        channelType: $scope.channel.type
      };
      channelsService.removeMemberFromChannel(data).then(function () {
        updateListItems();
        $log.info('Member Removed from Channel');
      }).catch(function (message) {
        $log.error('Error Removing member from channel:', message);
      });
    };

    $scope.pushMember = function (teamMember) {
      if (!teamMember.isChannelMember) {
        if (!$scope.addedMemberIds.find(function (member) {
            return member === teamMember.member_id;
          })) {
          $scope.addedMemberIds.push(teamMember.member_id);
          teamMember.isMemberSelected = true;
        }
        else {
          ArrayUtil.removeElementByValue($scope.addedMemberIds, teamMember.member_id);
          teamMember.isMemberSelected = false;
        }
      }
    };

    $scope.addMembersClick = function () {
      $scope.editMode = true;
      if ($scope.addingMemberActive === false) {
        $scope.addingMemberActive = true;
        updateListItems();
      }
      else {
        $scope.addingMemberActive = false;
        submitAddedMembers();
      }
    };

    function submitAddedMembers() {
      if ($scope.addedMemberIds.length > 0) {
        $scope.addingMemberActive = false;
        channelsService.addMembersToChannel($scope.addedMemberIds,
          $scope.channel.id).then(function () {
          updateListItems();
          $scope.addedMemberIds = [];
          $log.info('Done Adding members');
        }).catch(function () {
          updateListItems();
          $scope.addedMemberIds = [];
          $log.error('Error Adding members');
        });
      }
      else
        updateListItems();
    }

    $scope.getListItemCSS = function (listMember) {
      if ($scope.addingMemberActive) {
        if (listMember.isChannelMember ||
          ArrayUtil.contains($scope.addedMemberIds, listMember.member_id))
          return {'background-color': 'rgba(36, 167, 114, 0.2)'};
        else
          return {'background-color': 'white'};
      }
      else
        return {'background-color': 'white'};
    };

    $scope.showRemoveIcon = function (member) {
      if (User.getCurrent().isAdmin && !$scope.addingMemberActive) {
        return member.member_id !== User.getCurrent().memberId;
      } else {
        return false;
      }
    };

    $scope.archiveChannel = function () {
      channelsService.archiveChannel($scope.channel.id)
        .then(function () {
          $scope.closeDetailsModal();
        })
        .catch(function () {
          /*
           Handle Archive Channel Error;
           */
        });
    };

    $scope.userHasChannelArchivePermission = function () {
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
