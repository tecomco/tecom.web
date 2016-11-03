'use strict';

app.factory('authService', ['$http', '$localStorage', function ($http,
  $localStorage) {

  return {
    login: function (username, password) {
      var data = {
        username: username,
        password: password
      };
      $http({
        method: 'POST',
        url: '/api/v1/auth/login/',
        data: data,
        skipAuthorization: true
      }).then(function (response) {
        if (response.data.token) {
          $localStorage.userToken = response.data.token;
        }
      });
    }
  };
}]);
