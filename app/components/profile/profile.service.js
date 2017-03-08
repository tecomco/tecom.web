'use strict';

app.service('profileService', [
  '$log', 'Upload', 'User', '$http', '$q', 'ArrayUtil', 'AuthService',
  '$localStorage',
  function ($log, Upload, User, $http, $q, ArrayUtil, AuthService,
            $localStorage) {

    function changeUsername(username) {
      var defered = $q.defer();
      $http({
        method: 'PATCH',
        url: '/api/v1/auth/users/' + User.getCurrent().id + '/username/change/',
        data: {
          username: username
        }
      }).success(function (data) {
        $localStorage.token = data.token;
        User.getCurrent().username = username;
        var userInTeam = ArrayUtil.getElementByKeyValue(
          User.getCurrent().team.getActiveMembers(), 'id', User.getCurrent().memberId);
        userInTeam.username = username;
        AuthService.initialize();
        defered.resolve('نام کاربری با موفقیت تغییر کرد.');
      }).error(function (err) {
        $log.error('Error Changing Username', err);
        if (err.username) {
          if (ArrayUtil.contains(err.username, 'This field may not be blank.'))
            defered.reject('نام کاربری نباید خالی باشد.');
          else if (ArrayUtil.contains(err.username,
              'A user with that username already exists.'))
            defered.reject('این نام کاربری قبلا انتخاب شده است.');
          else if (ArrayUtil.contains(err.username,
              'Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.'))
            defered.reject('نام کاربری معتبر نیست، این نام تنها می تواند شامل حروف، اعداد و بعضی از علامت ها باشد.');
          else
            defered.reject('خطا در تغییر نام کاربری');
        }
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
      Upload.upload({
        url: '/api/v1/auth/users/' + User.getCurrent().id + '/image/change/',
        data: {
          image: file
        },
        method: 'PATCH'
      }).then(function (res) {
        User.getCurrent().image = res.data.image;
        defered.resolve('عکس پروفایل با موفقیت تغییر کرد.');
      }).catch(function (err) {
        $log.error('Error Changing Profile Image', err);
        defered.reject('خطا در تغییر عکس پروفایل');
      });
      return defered.promise;
    }

    function removeTeamMember(member) {
      var defered = $q.defer();
      $http({
        method: 'POST',
        url: '/api/v1/teams/'+ User.getCurrent().team.id +'/member/'+
        member.id + '/kick/'
      }).success(function () {
        defered.resolve();
      }).error(function (err) {
        $log.error('Error Making Admin', err);
        defered.reject();
      });
      return defered.promise;
    }

    function makeAdmin(member) {
      var defered = $q.defer();
      $http({
        method: 'POST',
        url: '/api/v1/teams/'+ User.getCurrent().team.id +'/member/'+
        member.id + '/admin/'
      }).success(function () {
        defered.resolve();
      }).error(function (err) {
        $log.error('Error Making Admin', err);
        defered.reject();
      });
      return defered.promise;
    }

    function disAdmin(member) {
      var defered = $q.defer();
      $http({
        method: 'POST',
        url: '/api/v1/teams/' + User.getCurrent().team.id + '/member/' +
        member.id + '/disadmin/'
      }).success(function () {
        defered.resolve();
      }).error(function (err) {
        $log.error('Error deAdmining', err);
        defered.reject();
      });
      return defered.promise;
    }

    function leaveTeam() {
      return $http({
        method: 'POST',
        url: '/api/v1/teams/member/' + User.getCurrent().memberId + '/leave/'
      });
    }

    function sendInvitationEmail(email) {
      return $http({
        method: 'POST',
        url: '/api/v1/teams/' + User.getCurrent().team.id + '/invite/send/',
        data: {
          email: email
        }
      });
    }

    return {
      changeUsername: changeUsername,
      changePassword: changePassword,
      changeProfileImage: changeProfileImage,
      removeTeamMember: removeTeamMember,
      makeAdmin: makeAdmin,
      disAdmin: disAdmin,
      leaveTeam: leaveTeam,
      sendInvitationEmail: sendInvitationEmail
    };
  }
]);
