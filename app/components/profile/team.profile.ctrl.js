'use strict';

app.controller('teamProfileController', [
  '$scope', '$log', 'profileService', '$uibModalInstance', 'CurrentMember',
  'Team', '$timeout', 'validationUtil', 'ArrayUtil', 'teamService',
  'channelsService', 'tourClicked', 'textUtil',
  function ($scope, $log, profileService, $uibModalInstance,
    CurrentMember, Team, $timeout, validationUtil, ArrayUtil, teamService,
    channelsService, tourClicked, textUtil) {

    $scope.teamActiveMembers = [];
    $scope.teamActiveEmails = [];
    $scope.plan = {};
    $scope.plan.teamPlanName = Team.plan.name;
    $scope.plan.membersLimit = Team.plan.membersLimit;
    initialize();

    $scope.$on('members:updated', function () {
      $scope.teamActiveMembers = Team.getActiveMembers();
    });

    $scope.sendInvitation = function (form) {
      var email = form.email.$modelValue;
      if (!email)
        setInfoOrErrorMessage('error', 'لطفا ایمیل رو وارد کن.');
      else if (validationUtil.validateEmail(email)) {
        profileService.sendInvitationEmail(email)
          .then(function (activeEmail) {
            $scope.teamActiveEmails.push(activeEmail.data);
            document.getElementById('invitedEmail').value = '';
            setInfoOrErrorMessage('info',
              'ایمیل دعوت به تیم با موفقیت ارسال شد.');
            $scope.inviteMode = false;
          })
          .catch(function (err) {
            $log.error('Invitation Error:', err);
            if (err.data && err.data[0] === 'Email already a member.')
              setInfoOrErrorMessage('error',
                'فرد مورد نظر در حال حاضر عضو تیمه.');
            else if (err.data && err.data[0] ===
              'Email already has an active invitaion.')
              setInfoOrErrorMessage('error',
                'ایمیل فعال‌سازی قبلاً ارسال شده.');
            else if (err.data && err.data[0] ===
              'Team reached members limit.')
              $scope.membersLimitError = true;
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
        profileService.makeAdmin(member)
          .then(function () {
            member.isAdmin = true;
          })
          .catch(function (err) {
            $log.error('Error Making Member Admin:', err);
          });
      } else {
        profileService.disAdmin(member)
          .then(function () {
            member.isAdmin = false;
          })
          .catch(function (err) {
            $log.error('Error DisAdmining Member:', err);
          });
      }
    };

    $scope.getAdminButtonCSS = function (member) {
      return member.isAdmin ? 'is-admin' : '';
    };

    $scope.resendInvitationEmail = function (emailId) {
      profileService.resendInvitationEmail(emailId)
        .then(function (activeEmail) {
          ArrayUtil.removeElementByKeyValue($scope.teamActiveEmails,
            'id', emailId);
          $scope.teamActiveEmails.push(activeEmail.data);
        });
    };

    $scope.deactivateEmailInvititaion = function (emailId) {
      profileService.deactivateEmailInvititaion(emailId)
        .then(function () {
          ArrayUtil.removeElementByKeyValue($scope.teamActiveEmails,
            'id', emailId);
        });
    };

    $scope.getTeamMembersCount = function () {
      var teamMembersCount = $scope.teamActiveEmails.length +
        $scope.teamActiveMembers.length;
      return textUtil.persianify(teamMembersCount + ' نفر از ' +
        Team.plan.membersLimit + ' نفر تعداد اعضای مجاز تیم.');
    };

    $scope.hasTeamReachedMembersLimit = function () {
      return ($scope.teamActiveMembers.length +
        $scope.teamActiveEmails.length) >= Team.plan.membersLimit;
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
      $scope.teamActiveMembers = Team.getActiveMembers();
      getTeamActiveEmails();
      $scope.team = Team;
      $scope.editTeamNameActive = false;
      $scope.inviteMode = false;
      $scope.forms = {};
    }

    function getTeamActiveEmails() {
      profileService.getTeamActiveEmails()
        .then(function (data) {
          $scope.teamActiveEmails = data.data;
        });
    }

    function isMe(member) {
      return member.id === CurrentMember.member.id;
    }

  }
]);
