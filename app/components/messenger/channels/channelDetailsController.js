'use strict';

app.controller('channelDetailsController', ['$uibModalInstance', '$log',
  'channelInfo', 'channelsService', 'User', 'arrayUtil',
  function ($uibModalInstance, $log, channelInfo, channelsService, User,
            arrayUtil) {

    var $ctrl = this;
    $ctrl.channel = channelInfo;
    var selectedChannelMember;

    $ctrl.channelType = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };
    $ctrl.editMode = false;
    $ctrl.isAdmin = true;
    $ctrl.details = {};
    $ctrl.forms = {};

    $ctrl.editChannel = function () {
      $ctrl.editMode = true;
      $ctrl.details.name = $ctrl.channel.name;
      $ctrl.details.description = $ctrl.channel.description;
      $ctrl.details.isPrivate = ($ctrl.channel.type === $ctrl.channelType.PRIVATE) ? true : false;
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
        $ctrl.channelType.PRIVATE : $ctrl.channelType.PUBLIC;
      var editedData = {
        name: $ctrl.details.name,
        description: $ctrl.details.description,
        type: type,
        id: $ctrl.channel.id
      };
      channelsService.sendDetailsEditedChannel(editedData, function (response) {
          $log.info('Edit channel Details response: ', response);
          if (response.status) {
            $ctrl.closeDetailsModal();
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
      $ctrl.AddingMemberActive = false;
      $log.info($ctrl.forms.detailsForm);
    };

    channelsService.getChannelMembers($ctrl.channel.id).then(function (event) {
      $ctrl.channel = event;
    }, function (status) {
      $log.info('error getting channel members :', status);
    });

    $ctrl.hoverIn = function(channelMember){
      selectedChannelMember = channelMember;
    };

    $ctrl.hoverOut = function(){
      selectedChannelMember = null;
    };

    $ctrl.deleteMember = function(member){

    };

    $ctrl.addMember = function(){
      $ctrl.AddingMemberActive = true;
      channelsService.getTeamMembers(User.team.id).then(function (teamMembers) {
        var members = teamMembers;
        $log.info('Team1:',members);
        $log.info('channelMEM:',$ctrl.channel.members);
        angular.forEach($ctrl.channel.members, function(channelMember){
          var index = arrayUtil.getIndexByKeyValue(members, 'id', channelMember.member_id);
          if (index > -1) {
            members.splice(index, 1);
          }
        });
        $ctrl.teamMembers = members;
        $log.info('Team2:',$ctrl.teamMembers);
      });
    };

    $ctrl.isChannelMemberSelected = function(channelMember){
      return selectedChannelMember === channelMember;
    };
  }
])
;
