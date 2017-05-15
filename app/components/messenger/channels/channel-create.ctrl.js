'use strict';

app.controller('createChannelController', ['$scope', '$uibModalInstance', '$log',
  'channelsService', 'Channel', 'ArrayUtil', 'CurrentMember', 'Team',
  function($scope, $uibModalInstance, $log, channelsService, Channel,
    ArrayUtil, CurrentMember, Team) {

    $scope.forms = {};
    $scope.newChannel = {};

    $scope.teamMembers = [];
    var selectedMembers = [];

    var makeSelectedMembersArray = function() {
      selectedMembers = [];
      selectedMembers.push(CurrentMember.member.id.toString());
      for (var i = 0; i < $scope.teamMembers.length; i++) {
        if ($scope.teamMembers[i].selected === true)
          selectedMembers.push($scope.teamMembers[i].id.toString());
      }
    };

    $scope.formNameCheckEmpty = function(form) {
      return ((form.name.$touched || form.$submitted) && (!form.name.$viewValue));
    };

    $scope.formNameCheckMax = function(form) {
      return (form.name.$viewValue && form.name.$invalid);
    };


    $scope.closeCreateChannel = function() {
      $uibModalInstance.close();
    };

    $scope.createChannelSubmit = function() {
      $scope.newChannel.serverError = false;
      if ($scope.forms.newChannelForm.$valid === true) {
        sendNewChannelData();
      }
    };

    var sendNewChannelData = function() {
      makeSelectedMembersArray();
      var newChannelType = $scope.newChannel.isPrivate ?
        Channel.TYPE.PRIVATE : Channel.TYPE.PUBLIC;
      var newChannelData = {
        name: $scope.newChannel.name,
        description: $scope.newChannel.description,
        type: newChannelType,
        member_ids: selectedMembers,
        creator: CurrentMember.member.id,
        team: Team.id
      };
      channelsService.createChannel(newChannelData)
        .then(function() {
          $scope.closeCreateChannel();
        })
        .catch(function(err) {
          if (err.indexOf('Duplicate slug in team.') != -1) {
            $log.error('Error Creating new Channel:', err);
            $scope.newChannel.dublicateError = true;
          } else {
            $scope.newChannel.serverError = true;
          }
        });
    };

    function makeTeamMembersArray() {
      Team.getActiveMembers().forEach(function(member) {
        $scope.teamMembers.push(member);
      });
      ArrayUtil.removeElementByKeyValue($scope.teamMembers,
        'id', CurrentMember.member.id);
    }

    angular.element(document).ready(function() {
      initializeNewChannelForm();
    });

    var initializeNewChannelForm = function() {
      $scope.newChannel.name = '';
      $scope.newChannel.description = '';
      $scope.newChannel.isPrivate = false;
      $scope.newChannel.dublicateError = false;
      $scope.newChannel.serverError = false;
      $scope.forms.newChannelForm.$setPristine();
      makeTeamMembersArray();
    };
  }
]);
