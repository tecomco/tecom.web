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
          templateUrl: 'app/components/messenger/messenger.view.html?v=1.0.8'
        },
        'channels@messenger': {
          templateUrl: 'app/components/messenger/channels/channels.view.html?v=1.0.8'
        }
      }
    })
    .state('messenger.home', {
      url: '/',
      template: '<div ng-controller="messagesController" class="msg-landing"><img src="static/img/tecom-bw.png" class="img-responsive" tour-step tour-step-content="سلام. به تیکام خوش اومدی! خوشحال می‌شم یه توضیح کوتاه بهت بدم... (۱/۸)" tour-step-order="0" tour-step-placement="right" /><h1>لطفا یک گروه را انتخاب کنید.</h1></div>'
    })
    .state('messenger.messages', {
      url: '/:slug',
      views: {
        '': {
          templateUrl: 'app/components/messenger/messages/messages.view.html?v=1.1.0'
        },
        'header@messenger.messages': {
          templateUrl: 'app/components/messenger/header/header.view.html?v=1.0.5'
        },
        'files@messenger.messages': {
          templateUrl: 'app/components/files/files.view.html?v=1.0.6'
        },
        'filemanager@messenger.messages': {
          templateUrl: 'app/components/files/filemanager-files.view.html?v=1.0.2'
        }
      },
      params: {
        slug: null
      }
    });
});
