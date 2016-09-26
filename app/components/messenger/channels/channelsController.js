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

  $scope.filterByPublicAndPrivate = function (channel) {
    return channel.type === channelType.PUBLIC || channel.type === channelType.PRIVATE;
  };

  $scope.filterByDirect = function (channel) {
    return channel.type === channelType.DIRECT;
  };


  channelsService.getChannels().then(function (data) {
    $scope.channels = data;
  });

});
