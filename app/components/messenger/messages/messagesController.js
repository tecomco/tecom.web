'use strict';

app.controller('messagesController', ['$scope', '$stateParams', '$log', 'messagesService',
  function ($scope, $stateParams, $log, messagesService) {

    $scope.messages = messagesService.getMessages();

    $scope.sendMessage = function(){
    }
  }
]);
