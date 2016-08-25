'use strict';

app.controller('channelsController', function ($scope, $stateParams, channelsService) {

    $scope.selectedChat = function () {
        return $stateParams.chatId;
    };

    $scope.channels = channelsService.getChannels();
    $scope.people = channelsService.getPeople();

});
