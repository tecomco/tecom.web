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

  var clearNewChannelForm = function(){
    $scope.newChannel.name = "";
    $scope.newChannel.description = "";
    $scope.newChannel.isPrivate = false;
  }
  $scope.filterByPublicAndPrivate = function (channel) {
    return channel.type === channelType.PUBLIC || channel.type === channelType.PRIVATE;
  };

  $scope.filterByDirect = function (channel) {
    return channel.type === channelType.DIRECT;
  };

  $scope.createChannelInitial = function () {
  }

  $scope.createChannelSubmit = function () {
    clearNewChannelForm();
  }

  $scope.exitCreateChannel = function(){
    clearNewChannelForm();
  }
  channelsService.getChannels().then(function (data) {
    $scope.channels = data;
  });

  $scope.checkTextSizeValidation = function(text, size){
    console.log(text);
  }

});
