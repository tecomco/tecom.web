'use strict';

app.service('profileService', [
  '$log', 'Upload', '$http', '$q', 'socket', 'ArrayUtil', 'AuthService',
  '$localStorage', 'CurrentMember', 'Team',
  function ($log, Upload, $http, $q, socket, ArrayUtil, AuthService,
    $localStorage, CurrentMember, Team) {

    function changeUsername(username) {
      var defered = $q.defer();
      $http({
          method: 'PATCH',
          url: '/api/v1/auth/users/' + CurrentMember.member.user.id +
            '/username/change/',
          data: {
            username: username
          }
        })
        .then(function (data) {
          $localStorage.token = data.token;
          CurrentMember.username = username;
          var userInTeam = ArrayUtil.getElementByKeyValue(
            Team.getActiveMembers(), 'id', CurrentMember.member.id);
          userInTeam.username = username;
          AuthService.initialize();
          defered.resolve('نام کاربری با موفقیت تغییر کرد.');
        })
        .catch(function (err) {
          $log.error('Error Changing Username', err);
          if (err.username) {
            if (ArrayUtil.contains(err.username,
                'This field may not be blank.'))
              defered.reject('نام کاربری نباید خالی باشد.');
            else if (ArrayUtil.contains(err.username,
                'A user with that username already exists.'))
              defered.reject('این نام کاربری قبلا انتخاب شده است.');
            else if (ArrayUtil.contains(err.username,
                'Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.'
              ))
              defered.reject(
                'نام کاربری معتبر نیست، این نام تنها می تواند شامل حروف، اعداد و بعضی از علامت ها باشد.'
              );
            else
              defered.reject('خطا در تغییر نام کاربری');
          } else
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
        })
        .then(function (data) {
          defered.resolve('رمز عبور با موفقیت تغییر کرد.');
        })
        .catch(function (err) {
          $log.error('Error Changing Password', err);
          defered.reject('خطا در تغییر رمز عبور');
        });
      return defered.promise;
    }

    function changeProfileImage(file) {
      var defered = $q.defer();
      Upload.upload({
          url: '/api/v1/auth/users/' + CurrentMember.member.user.id +
            '/image/change/',
          data: {
            image: file
          },
          method: 'PATCH'
        })
        .then(function (res) {
          CurrentMember.member.image = res.data.image;
          defered.resolve('عکس پروفایل با موفقیت تغییر کرد.');
        })
        .catch(function (err) {
          $log.error('Error Changing Profile Image', err);
          defered.reject('خطا در تغییر عکس پروفایل');
        });
      return defered.promise;
    }

    function removeTeamMember(member) {
      var defered = $q.defer();
      var data = {
        memberId: member ? member.id : CurrentMember.member.id
      };
      socket.emit('member:remove', data, function (res) {
        if (res.status) {
          defered.resolve();
        } else {
          $log.error('Error :', res.message);
          defered.reject();
        }
      });
      return defered.promise;
    }

    function makeAdmin(member) {
      var defered = $q.defer();
      $http({
          method: 'POST',
          url: '/api/v1/teams/' + Team.id + '/member/' +
            member.id + '/admin/'
        })
        .then(function () {
          defered.resolve();
        })
        .catch(function (err) {
          $log.error('Error Making Admin', err);
          defered.reject();
        });
      return defered.promise;
    }

    function disAdmin(member) {
      var defered = $q.defer();
      $http({
          method: 'POST',
          url: '/api/v1/teams/' + Team.id + '/member/' +
            member.id + '/disadmin/'
        })
        .then(function () {
          defered.resolve();
        })
        .catch(function (err) {
          $log.error('Error deAdmining', err);
          defered.reject();
        });
      return defered.promise;
    }


    function sendInvitationEmail(email) {
      return $http({
        method: 'POST',
        url: '/api/v1/teams/' + Team.id + '/invite/send/',
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
      sendInvitationEmail: sendInvitationEmail
    };
  }
]);
