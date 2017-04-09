'use strict';

app.run(['$window', '$exceptionHandler',
  function ($window, $exceptionHandler) {
    $window.onerror = function (message, url, line, col, error) {
      if (!error) {
        error = new Error(message);
      }
      $exceptionHandler(error);
    };
  }
]);

app.config(['$provide', function ($provide) {
  $provide.decorator('$exceptionHandler', ['$delegate', '$injector',
    function ($delegate, $injector) {
      return function (exception, cause) {
        $delegate(exception, cause);
        var $http = $injector.get('$http');
        var $log = $injector.get('$log');
        var User = $injector.get('User');
        var error = {
          message: exception.message,
          stacktrace: exception.stack,
          user_agent: window.navigator.userAgent
        };
        if (User.getCurrent()) {
          error.member = User.getCurrent().memberId;
        }
        $http.post('/api/v1/logs/create/', error)
          .then(function () {
            $log.info('Error log sent to server successfully. We will fix it soon.');
          })
          .catch(function () {
            $log.error('Error sending error log to server');
          });
      };
    }
  ]);
}]);
