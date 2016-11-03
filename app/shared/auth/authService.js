'use strict';

app.factory('authService', ['$http', 'jwtHelper', '$localStorage',
  function ($http, jwtHelper, $localStorage) {

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
            $localStorage.decodedToken = jwtHelper.decodeToken(
              response.data.token);
            console.log($localStorage.decodedToken);
          }
        });
      }
    };
  }]);
