'use strict';

app.controller('channelsController',
  ['$scope', '$state', '$stateParams', '$log', '$uibModal', '$localStorage',
    'channelsService', 'arrayUtil', 'Channel', 'messagesService', 'Message',
  function ($scope, $state, $stateParams, $log, $uibModal, $localStorage,
    channelsService, arrayUtil, Channel, messagesService, Message) {

    $scope.channels = [];
    $scope.directs = [];

    $scope.$on('channel', function (event, data) {
      $scope.channels = channelsService.getPublicsAndPrivates();
      $scope.directs = channelsService.getDirects();
      validateUrlChannel();
    });

    function validateUrlChannel() {
      if ($stateParams.slug) {
        var slug = $stateParams.slug.replace('@', '');
        var channel = channelsService.findChannelBySlug(slug);
        if (channel) {
          $state.go('messenger.messages', {
            slug: channel.slug
          });
        } else {
          $state.go('messenger.home');
        }
      }
    }

    $scope.openModal = function (name) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: name + 'Modal.html',
        controller: name + 'Controller',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function () {}, function () {});
    };

  }
]);
