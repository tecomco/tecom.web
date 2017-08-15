'use strict';

app.controller('teamProfileController', [
  '$scope', '$log', 'profileService', '$uibModalInstance', 'CurrentMember',
  'Team', '$timeout', 'validationUtil', 'ArrayUtil', 'teamService',
  'channelsService', 'tourClicked',
  function ($scope, $log, profileService, $uibModalInstance,
    CurrentMember, Team, $timeout, validationUtil, ArrayUtil, teamService,
    channelsService, tourClicked) {

    initialize();

    $scope.$on('members:updated', function () {
      $scope.teamMembers = Team.getActiveMembers();
    });

    $scope.sendInvitation = function (form) {
      var email = form.email.$modelValue;
      if (!email)
        setInfoOrErrorMessage('error', 'لطفا ایمیل رو وارد کن.');
      else if (validationUtil.validateEmail(email)) {
        profileService.sendInvitationEmail(email)
          .then(function () {
            document.getElementById('invitedEmail').value = '';
            setInfoOrErrorMessage('info',
              'ایمیل دعوت به تیم با موفقیت ارسال شد.');
            $scope.inviteMode = false;
          }).catch(function (err) {
            $log.error('Invitation Error:', err);
            if (err.data && err.data[0] === 'Email already a member.')
              setInfoOrErrorMessage('error',
                'فرد مورد نظرت در حال حاضر عضو تیمه');
            else if (err.data && err.data[0] ===
              'Email already has an active invitaion.')
              setInfoOrErrorMessage('error',
                'ایمیل فعال سازی ارسال شده است.');
            else
              setInfoOrErrorMessage('error', 'خطا در دعوت به تیم');
          });
      } else
        setInfoOrErrorMessage('error', 'ایمیل وارد شده معتبر نیست');
    };

    $scope.editTeamName = function () {
      $scope.editTeamNameActive = true;
    };

    $scope.saveTeamName = function () {
      $scope.editTeamNameActive = false;
    };

    $scope.removeTeamMember = function (member) {
      profileService.removeTeamMember(member);
    };

    $scope.changeMemberAdminState = function (member) {
      if (member.isAdmin === false) {
        profileService.makeAdmin(member).then(function () {
          member.isAdmin = true;
        }).catch(function (err) {
          $log.error('Error Making Member Admin:', err);
        });
      } else {
        profileService.disAdmin(member).then(function () {
          member.isAdmin = false;
        }).catch(function (err) {
          $log.error('Error DisAdmining Member:', err);
        });
      }
    };

    $scope.getAdminButtonCSS = function (member) {
      return member.isAdmin ? 'is-admin' : '';
    };

    $scope.onTourReady = function (tour) {
      if (tourClicked) {
        $timeout(function () {
          tour.start();
        }, 500);
      }
    };

    function setInfoOrErrorMessage(type, message) {
      switch (type) {
        case 'info':
          $scope.infoMessage = message;
          $scope.showInfoMessage = true;
          $timeout(function () {
            $scope.showInfoMessage = false;
            $scope.infoMessage = null;
          }, 4000);
          break;
        case 'error':
          $scope.showErrorMessage = true;
          $scope.errorMessage = message;
          $timeout(function () {
            $scope.showErrorMessage = false;
            $scope.errorMessage = null;
          }, 4000);
          break;
      }
    }

    $scope.isAdminOrAnotherMember = function (member) {
      return !isMe(member) && CurrentMember.member.isAdmin;
    };

    function initialize() {
      $scope.teamMembers = Team.getActiveMembers();
      $scope.team = Team;
      $scope.editTeamNameActive = false;
      $scope.inviteMode = false;
      $scope.forms = {};
    }

    function isMe(member) {
      return member.id === CurrentMember.member.id;
    }

  }
]);
