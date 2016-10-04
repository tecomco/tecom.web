'use strict';

app.controller('messagesController', ['$scope', '$stateParams', 'messagesService',
  function ($scope, $stateParams, messagesService) {

    $scope.messages = messagesService.getMessages();

    // TODO: Remove this.
    // $scope.textChanged = function (message) {
    //   $scope.messages[0].body = message;
    // };
  }
]);
