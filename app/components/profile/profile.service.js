'use strict';

app.service('profileService', ['$log', 'User', '$http', '$q', 'ArrayUtil',
  function ($log, User, $http, $q, ArrayUtil) {

    function changeUsername(username) {
      var defered = $q.defer();
      $log.info('user:', username);
      $http({
        method: 'PATCH',
        url: '/api/v1/teams/member/' + User.getCurrent().id + '/change/username/',
        data: {username: username}
      }).success(function (data) {
        User.getCurrent().username = data.username;
        defered.resolve('نام کاربری با موفقیت تغییر کرد.');
      }).error(function (err) {
        $log.error('Error Changing Username', err);
        if (ArrayUtil.contains(err.username, 'This field may not be blank.'))
          defered.reject('نام کاربری نباید خالی باشد.');
        else
          defered.reject('خطا در تغییر نام کاربری');
      });
      return defered.promise;
    }

    function changePassword(oldPass, newPass, confirm) {
      var defered = $q.defer();
      $http({
        method: 'POST',
        url: '/api/v1/auth/password/change/',
        data: {
          old_password: oldPass,
          new_password1: newPass,
          new_password2: confirm
        }
      }).success(function (data) {
        defered.resolve('رمز عبور با موفقیت تغییر کرد.');
      }).error(function (err) {
        $log.error('Error Changing Password', err);
        defered.reject('خطا در تغییر رمز عبور');
      });
      return defered.promise;
    }

    function changeProfileImage(file) {
      var defered = $q.defer();
      console.log(file);
      $http({
        method: 'PUT',
        url: '/api/v1/teams/member/' + User.getCurrent().id + '/change/image/',
        data: {image: file}
      }).success(function (data) {
        defered.resolve('عکس پروفایل با موفقیت تغییر کرد.');
      }).error(function (err) {
        $log.error('Error Changing Profile Image', err);
        defered.reject('خطا در تغییر عکس پروفایل');
      });
      return defered.promise;
    }

    function removeTeamMember(member) {
      //Http Rquest
      var defered = $q.defer();
      $http({
        method: 'PATCH',
        url: '/api/v1/teams/member/' + User.getCurrent().id + '/change/username/',
        data: {username: username}
      }).success(function (data) {
        User.getCurrent().username = data.username;
        defered.resolve();
      }).error(function (err) {
        $log.error('Error Removing Team Member', err);
        defered.reject();
      });
      return defered.promise;
    }

    function makeAdmin(member) {
      //Http Rquest
      var defered = $q.defer();
      $http({
        method: 'PATCH',
        url: '/api/v1/teams/member/' + User.getCurrent().id + '/change/username/',
        data: {username: username}
      }).success(function (data) {
        User.getCurrent().username = data.username;
        defered.resolve();
      }).error(function (err) {
        $log.error('Error Making Admin', err);
        defered.reject();
      });
      return defered.promise;
    }

    return {
      changeUsername: changeUsername,
      changePassword: changePassword,
      changeProfileImage: changeProfileImage,
      removeTeamMember: removeTeamMember,
      makeAdmin: makeAdmin
    };
  }]);