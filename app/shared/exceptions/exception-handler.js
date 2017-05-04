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
        var CurrentMember = $injector.get('CurrentMember');
        var error = {
          message: exception.message,
          stacktrace: exception.stack,
          user_agent: window.navigator.userAgent
        };
        if (CurrentMember.exists()) {
          error.member = CurrentMember.member.id;
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
