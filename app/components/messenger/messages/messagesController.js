'use strict';

app.controller('messagesController', function($scope, $stateParams, messagesService) {

    $scope.messages = messagesService.getMessages();
    $scope.textChanged = function (message) {
        $scope.messages[0].body = message;
    }
});
