'use strict';

app.config(['$locationProvider', function ($locationProvider) {
  $locationProvider.html5Mode(true);
}]);

app.config(function ($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/messenger/');
  $stateProvider
    .state('messenger', {
      abstract: true,
      url: '/messenger',
      views: {
        '': {
          templateUrl: 'app/components/messenger/messengerView.html'
        },
        'channels@messenger': {
          templateUrl: 'app/components/messenger/channels/channelsView.html'
        }
      }
    })
    .state('messenger.home', {
      url: '/',
      template: '<h1>لطفا یک گروه را انتخاب کنید.</h1>'
    })
    .state('messenger.messages', {
      url: '/:chatId',
      views: {
        '': {
          templateUrl: 'app/components/messenger/messages/messagesView.html'
        },
        'header@messenger.messages': {
          templateUrl: 'app/components/messenger/header/headerView.html'
        }
      }
    });
});
