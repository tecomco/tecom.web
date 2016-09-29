'use strict';

app.controller('channelsController', function ($scope, $stateParams, channelsService) {
  $scope.selectedChat = function () {
    return $stateParams.chatId;
  };
  var channelType = {
    PUBLIC: 0,
    PRIVATE: 1,
    DIRECT: 2
  };

  console.log('Instanciated newChannel.');
  $scope.newChannel = {};
  $scope.forms = {};

  var clearNewChannelForm = function () {
    $scope.newChannel.name = '';
    $scope.newChannel.description = '';
    $scope.newChannel.isPrivate = false;
  };

  $scope.filterByPublicAndPrivate = function (channel) {
    return channel.type === channelType.PUBLIC || channel.type === channelType.PRIVATE;
  };

  $scope.filterByDirect = function (channel) {
    return channel.type === channelType.DIRECT;
  };

  $scope.createChannelInitial = function () {
    console.log($scope.newChannel);
    clearNewChannelForm();
    $scope.forms.newChannelForm.$setPristine();
    $('#createChannelModal').modal();
  }

  $scope.createChannelSubmit = function () {
    console.log("Salam");
  }

  $scope.exitCreateChannel = function () {
  }

  channelsService.getChannels().then(function (data) {
    $scope.channels = data;
  });

  $scope.checkTextSizeValidation = function (text, size) {
    console.log(text);
  }

});
