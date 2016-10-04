'use strict';

app.controller('channelsController', ['$scope', '$stateParams', '$log',
  '$uibModal', 'channelsService',
  function ($scope, $stateParams, $log, $uibModal, channelsService) {

    $scope.newChannel = {};
    $scope.forms = {};

    $scope.selectedChat = function () {
      return $stateParams.chatId;
    };

    $scope.filterByPublicAndPrivate = function (channel) {
      return channel.type === channelType.PUBLIC ||
        channel.type === channelType.PRIVATE;
    };

    $scope.filterByDirect = function (channel) {
      return channel.type === channelType.DIRECT;
    };

    $scope.createChannelInitial = function () {
      initializeNewChannelForm();
      $uibModal.open({
        templateUrl: 'createChannelModal.html',
        controller: 'createChannelController',
        controllerAs: '$ctrl'
      });
      $log.info('New channel modal opened.');
    };

    $scope.createChannelSubmit = function () {
      sendNewChannelData();
      $log.info('New channel form submited.');
    };

    $scope.closeCreateChannel = function () {
      $('#createChannelModal').modal('toggle');
      $log.info('New channel modal closed.');
    };

    channelsService.getChannels().then(function (data) {
      $scope.channels = data;
    });

    var channelType = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };

    var initializeNewChannelForm = function () {
      $scope.newChannel.name = '';
      $scope.newChannel.description = '';
      $scope.newChannel.isPrivate = false;
      $scope.forms.newChannelForm.serverError = false;
      $scope.forms.newChannelForm.$setPristine();
    };

    var sendNewChannelData = function () {
      $log.info('Sending Form to Server.');
      var newChannelType = $scope.newChannel.isPrivate ?
        channelType.PRIVATE : channelType.PUBLIC;
      var newChannelData = {
        name: $scope.newChannel.name,
        description: $scope.newChannel.description,
        type: newChannelType,
        members: '',
        creator: 1
      };
      channelsService.sendNewChannel(newChannelData, function (response) {
        $log.info('New channel response: ' + response);
        if (response.status) {
          $scope.closeCreateChannel();
        } else {
          $log.error('Error sending new channel form to server.');
          $log.error('Error meessage: ' + response.meessage);
          $scope.forms.newChannelForm.serverError = true;
        }
      });
    };
  }
]);
