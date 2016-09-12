'use strict';

app.controller('channelsController', function ($scope, $stateParams, channelsService, socket) {

    $scope.selectedChat = function () {
        return $stateParams.chatId;
    };

    socket.on('init', function(data){
        $scope.channels = data;
    });

    $scope.people = channelsService.getPeople();
});
