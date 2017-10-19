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
          templateUrl: 'app/components/messenger/channels/channels.view.html?v=1.0.9'
        }
      }
    })
    .state('messenger.home', {
      url: '/',
      template: '<div ng-controller="messagesController" class="msg-landing"><img src="static/img/tecom-bw.png" class="img-responsive" tour-step tour-step-title="خوش اومدی!" tour-step-content="سلام. به تیکام خوش اومدی! خوشحال می‌شم یه توضیح کوتاه بهت بدم..." tour-step-order="0" tour-step-placement="right" /><h1>لطفا یک گروه را انتخاب کنید.</h1></div>'
    })
    .state('messenger.messages', {
      url: '/:slug',
      views: {
        '': {
          templateUrl: 'app/components/messenger/messages/messages.view.html?v=1.1.2'
        },
        'header@messenger.messages': {
          templateUrl: 'app/components/messenger/header/header.view.html?v=1.0.5'
        },
        'toolbar@messenger.messages': {
          templateUrl: 'app/components/messenger/toolbar/toolbar.view.html'
        },
        'files@messenger.messages': {
          templateUrl: 'app/components/messenger/toolbar/files.view.html'
        },
        'filemanager@messenger.messages': {
          templateUrl: 'app/components/messenger/toolbar/filemanager-files.view.html'
        }
      },
      params: {
        slug: null
      }
    });
});
