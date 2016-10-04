'use strict';

app.controller('channelsController', ['$scope', '$stateParams', '$log',
  '$uibModal', 'channelsService',
  function ($scope, $stateParams, $log, $uibModal, channelsService) {

    var channelType = {
      PUBLIC: 0,
      PRIVATE: 1,
      DIRECT: 2
    };

    $scope.selectedChat = function () {
      return $stateParams.chatId;
    };

    $scope.filterByPublicAndPrivate = function (channel) {
      return channel.type === channelType.PUBLIC ||
        channel.type === channelType.PRIVATE;
    };

    $scope.filterByDirect = function (channel) {
      return channel.type === channelType.DIRECT;
    };

    channelsService.getChannels().then(function (data) {
      $scope.channels = data;
    });

    /////////////////////////////////////////////////////////////////////////

    // var $ctrl = this;
    //
    // $scope.open = function () {
    //   var modalInstance = $uibModal.open({
    //     animation: $ctrl.animationsEnabled,
    //     ariaLabelledBy: 'modal-title',
    //     ariaDescribedBy: 'modal-body',
    //     templateUrl: 'createChannelView.html',
    //     controller: 'createChannelController',
    //     controllerAs: '$ctrl',
    //     resolve: {
    //       items: function () {
    //         return $ctrl.items;
    //       }
    //     }
    //   });
    //
    //   modalInstance.result.then(function (selectedItem) {
    //     $ctrl.selected = selectedItem;
    //   }, function () {
    //     $log.info('Modal dismissed at: ' + new Date());
    //   });
    // };

    $scope.createChannelOpen = function () {
      $uibModal.open({
        templateUrl: 'app/components/messenger/channels/createChannelView.html',
        controller: 'createChannelController',
        controllerAs: '$ctrl'
      });
      $log.info('New channel modal opened.');
    };


    /*$scope.createChannelSubmit = function () {
      sendNewChannelData();
      $log.info('New channel form submited.');
    };

    $scope.closeCreateChannel = function () {
      $('#createChannelModal').modal('toggle');
      $log.info('New channel modal closed.');
    };

    var initializeNewChannelForm = function () {
      $scope.newChannel.name = '';
      $scope.newChannel.description = '';
      $scope.newChannel.isPrivate = false;
      $scope.forms.newChannelForm.serverError = false;
      $scope.forms.newChannelForm.$setPristine();
      $log.info($scope.forms.newChannelForm);
    };

    var sendNewChannelData = function () {
      $log.info('Sending Form to Server.');
      var newChannelType = $scope.newChannel.isPrivate ?
        channelType.PRIVATE : channelType.PUBLIC;
      var newChannelData = {
        name: $scope.newChannel.name,
        description: $scope.newChannel.description,
        type: newChannelType,
        members: '',
        creator: 1
      };
      channelsService.sendNewChannel(newChannelData, function (response) {
        $log.info('New channel response: ' + response);
        if (response.status) {
          $scope.closeCreateChannel();
        } else {
          $log.error('Error sending new channel form to server.');
          $log.error('Error meessage: ' + response.meessage);
          $scope.forms.newChannelForm.serverError = true;
        }
      });
    };
    */

  }
]);
