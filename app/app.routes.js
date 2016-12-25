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
      },
      onEnter: function ($window, User) {
        if (!User.exists()) {
          $window.location.assign('/login');
        }
      }
    })
    .state('messenger.home', {
      url: '/',
      template: '<div class="msg-landing"><div class="col-sm-4"></div><div class="col-sm-4"><img src="static/img/tecom-bw.png" class="img-responsive" /><h1>لطفا یک گروه را انتخاب کنید.</h1></div></div>'
    })
    .state('messenger.messages', {
      url: '/:slug',
      views: {
        '': {
          templateUrl: 'app/components/messenger/messages/messagesView.html'
        },
        'header@messenger.messages': {
          templateUrl: 'app/components/messenger/header/headerView.html'
        }
      },
      params: {
        channel: null,
        slug: null
      }
    });
});
