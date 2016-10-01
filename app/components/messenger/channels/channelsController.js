'use strict';

app.controller('channelsController', ['$scope', '$stateParams', '$log', 'channelsService', function ($scope, $stateParams, $log, channelsService) {

  $scope.newChannel = {};
  $scope.forms = {};
  $scope.selectedChat = function () {
    return $stateParams.chatId;
  };

  $scope.filterByPublicAndPrivate = function (channel) {
    return channel.type === channelType.PUBLIC || channel.type === channelType.PRIVATE;
  };

  $scope.filterByDirect = function (channel) {
    return channel.type === channelType.DIRECT;
  };

  $scope.createChannelInitial = function () {
    $log.info('New channel modal opened');
    initializeNewChannelForm();
    $('#createChannelModal').modal();
  }

  $scope.createChannelSubmit = function () {
    $log.info('New channel form submited');
    sendNewChannelData();
  }

  $scope.closeCreateChannel = function () {
    $log.info('New channel modal closed');
  }

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
    $log.info('Sneding Form to Server...');
    var newChannelType = $scope.newChannel.isPrivate ? channelType.PRIVATE : channelType.PUBLIC;
    var newChannelData = {
      name: $scope.newChannel.name,
      description: $scope.newChannel.description,
      type: newChannelType,
      members: '',
      creator: '1'
    };
    channelsService.sendNewChannel(newChannelData, function (response) {
      console.log(response);
      if (response.status) {
        $('#createChannelModal').modal('toggle');
        $log.info('New channel modal closed')
      }
      else {
        $error('Error sending new channel form to server');
        $scope.forms.newChannelForm.serverError = true;
      }
    });
  };
}]);
