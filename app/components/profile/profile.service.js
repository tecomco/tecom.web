'use strict';

app.service('profileService', [
  '$log', 'Upload', '$http', '$q', 'socket', 'ArrayUtil', 'AuthService',
  '$localStorage', 'CurrentMember', 'Team',
  function ($log, Upload, $http, $q, socket, ArrayUtil, AuthService,
    $localStorage, CurrentMember, Team) {

    function changeUsername(username) {
      var deferred = $q.defer();
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
          deferred.resolve('نام کاربری با موفقیت تغییر کرد.');
        })
        .catch(function (err) {
          $log.error('Error Changing Username', err);
          if (err.username) {
            if (ArrayUtil.contains(err.username,
                'This field may not be blank.'))
              deferred.reject('نام کاربری نباید خالی باشد.');
            else if (ArrayUtil.contains(err.username,
                'A user with that username already exists.'))
              deferred.reject('این نام کاربری قبلا انتخاب شده است.');
            else if (ArrayUtil.contains(err.username,
                'Enter a valid username. This value may contain only letters, numbers, and @/./+/-/_ characters.'
              ))
              deferred.reject(
                'نام کاربری معتبر نیست، این نام تنها می تواند شامل حروف، اعداد و بعضی از علامت ها باشد.'
              );
            else
              deferred.reject('خطا در تغییر نام کاربری');
          } else
            deferred.reject('خطا در تغییر نام کاربری');
        });
      return deferred.promise;
    }

    function changePassword(oldPass, newPass, confirm) {
      var deferred = $q.defer();
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
          deferred.resolve('رمز عبور با موفقیت تغییر کرد.');
        })
        .catch(function (err) {
          $log.error('Error Changing Password', err);
          deferred.reject('خطا در تغییر رمز عبور');
        });
      return deferred.promise;
    }

    function changeProfileImage(file) {
      var deferred = $q.defer();
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
          deferred.resolve('عکس پروفایل با موفقیت تغییر کرد.');
        })
        .catch(function (err) {
          $log.error('Error Changing Profile Image', err);
          deferred.reject('خطا در تغییر عکس پروفایل');
        });
      return deferred.promise;
    }

    function removeTeamMember(member) {
      var deferred = $q.defer();
      var data = {
        memberId: member ? member.id : CurrentMember.member.id
      };
      socket.emit('member:remove', data, function (res) {
        if (res.status) {
          deferred.resolve();
        } else {
          $log.error('Error :', res.message);
          deferred.reject();
        }
      });
      return deferred.promise;
    }

    function makeAdmin(member) {
      var deferred = $q.defer();
      $http({
          method: 'POST',
          url: '/api/v1/teams/' + Team.id + '/member/' +
            member.id + '/admin/'
        })
        .then(function () {
          deferred.resolve();
        })
        .catch(function (err) {
          $log.error('Error Making Admin', err);
          deferred.reject();
        });
      return deferred.promise;
    }

    function disAdmin(member) {
      var deferred = $q.defer();
      $http({
          method: 'POST',
          url: '/api/v1/teams/' + Team.id + '/member/' +
            member.id + '/disadmin/'
        })
        .then(function () {
          deferred.resolve();
        })
        .catch(function (err) {
          $log.error('Error deAdmining', err);
          deferred.reject();
        });
      return deferred.promise;
    }


    function getTeamActiveEmails() {
      return $http({
          method: 'GET',
          url: '/api/v1/teams/' + Team.id + '/invitations'
        })
        .catch(function (err) {
          $log.info('Error Getting Team Invitation Emails.', err);
        });
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

    function resendInvitationEmail(emailId) {
      return $http({
          method: 'POST',
          url: '/api/v1/teams/' + Team.id + '/invitations/' + emailId +
            '/resend'
        })
        .catch(function (err) {
          $log.info('Error Resending Invitation Email.', err);
        });
    }

    function deactivateEmailInvititaion(emailId) {
      return $http({
          method: 'POST',
          url: '/api/v1/teams/' + Team.id + '/invitations/' + emailId +
            '/deactivate'
        })
        .catch(function (err) {
          $log.info('Error Deactivating Invitation Email.', err);
        });
    }

    return {
      changeUsername: changeUsername,
      changePassword: changePassword,
      changeProfileImage: changeProfileImage,
      removeTeamMember: removeTeamMember,
      makeAdmin: makeAdmin,
      disAdmin: disAdmin,
      getTeamActiveEmails: getTeamActiveEmails,
      sendInvitationEmail: sendInvitationEmail,
      resendInvitationEmail: resendInvitationEmail,
      deactivateEmailInvititaion: deactivateEmailInvititaion
    };
  }
]);
