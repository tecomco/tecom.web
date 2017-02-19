'use strict';

app.controller('MessengerCtrl', ['$scope', '$window', '$uibModal',
  'AuthService', 'User', '$rootScope',
  function ($scope, $window, $uibModal, AuthService, User) {

    $scope.activeFile = false;
    $scope.isAdmin = User.getCurrent().isAdmin;
    $scope.openModal = function (name) {
      var modalInstance = $uibModal.open({
        animation: true,
        templateUrl: name + '.html',
        controller: name + 'Controller',
        controllerAs: '$ctrl'
      });
      modalInstance.result.then(function () {}, function () {});
    };

    $scope.$on('view:state:changed', function (event, state) {
      $scope.activeFile = (state === 'noFile') ? false : true;
    });

    $scope.getPannelsCSS = function(pannel){
      if(pannel === 'messages'){
        if($scope.activeFile)
          return 'col-sm-6 col-lg- no-padding';
        else
          return 'col-sm-8 col-lg- no-padding';
      }
      else if(pannel === 'files'){
        if($scope.activeFile)
          return 'col-sm-6 col-lg-6 no-padding doc-section';
        else
          return 'col-sm-4 col-lg- no-padding';
      }
    };

    $scope.logout = function () {
      AuthService.logout()
        .then(function () {
          $window.location.href = '/login';
        });
    };

  }
]);
