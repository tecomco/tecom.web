'use strict';

app.service('profileService', ['$log', 'User', '$http',
  function ($log, User, $http) {

    function changeUsername(username) {
      $http({
        method: 'PATCH',
        url: '/api/v1/teams/member/' + User.id + '/change/username/',
        data: {username: username}
      }).success(function (data) {
        User.username = data.username;
      }).error(function (err) {
        $log.error('Error Changing Username', err);
      });
    }

    return {
      changeUsername: changeUsername
    };
  }]);