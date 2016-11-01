'use strict';

app.factory('authService', ['$http', '$localStorage', function ($http,
  $localStorage) {

  return {
    login: function (username, password) {
      $http.post('/api/v1/auth/login/', {
        username: username,
        password: password
      }).then(function (response) {
        if (response.data.token) {
          $localStorage.userToken = response.data.token;
        }
      });
    }
  };
}]);
