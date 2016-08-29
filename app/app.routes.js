'use strict';

app.config(['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
}]);

app.config(function($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/messenger/');
    $stateProvider
        .state('messenger', {
            url: '/messenger/:chatId',
            views: {
                '': {
                    templateUrl: 'app/components/messenger/messengerView.html'
                },
                'header@messenger': {
                    templateUrl: 'app/components/messenger/header/headerView.html'
                },
                'channels@messenger': {
                    templateUrl: 'app/components/messenger/channels/channelsView.html'
                },
                'messages@messenger': {
                    templateUrl: 'app/components/messenger/messages/messagesView.html'
                }
            }
        });
});
