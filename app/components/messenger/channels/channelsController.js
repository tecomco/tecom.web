'use strict';

app.controller('channelsController', function ($scope, $stateParams, channelsService, socket) {

    $scope.selectedChat = function () {
        return $stateParams.chatId;
    };

    // $scope.$watch(function () {
    //     return channelsService.getChannels();
    // }, function (channels) {
    //     console.log('changed...!');
    //     $scope.channels = channels;
    //     $scope.$apply();
    // });

    socket.on('init', function(data){
        // console.log(data.chan);
        $scope.channels = data;
        // console.log($scope.channels);
    });

    // $scope.channels = channelsService.getChannels();
    $scope.people = channelsService.getPeople();

});
