'use strict';

app.factory('Message', [
  '$log', 'db', 'textUtil', 'channelsService', 'fileUtil', 'dateUtil',
  'CurrentMember', 'Team',
  function ($log, db, textUtil, channelsService, fileUtil, dateUtil,
    CurrentMember, Team) {

    function Message(body, type, senderId, channelId, _id, datetime,
      additionalData, about, isPending) {
      this.setValues(body, type, senderId, channelId, _id, datetime,
        additionalData, about, isPending);
    }

    Message.prototype.setValues = function (body, type, senderId, channelId,
      _id, datetime, additionalData, about, isPending) {
      this.body = body;
      this.type = type;
      this.senderId = senderId;
      this.channelId = channelId;
      this._id = _id || null;
      this.about = about || null;
      this.datetime = datetime ? new Date(datetime) : new Date();
      this.additionalData = additionalData || null;
      if (this._id) {
        this.id = Message.generateIntegerId(_id);
      }
      this.isPending = isPending || false;
      var currentChannel = channelsService.getCurrentChannel();
      if (currentChannel) {
        this.teamId = currentChannel.teamId;
      }
    };

    Message.prototype.getUsername = function () {
      if (CurrentMember.member.isTecomBot()) {
        return '';
      }
      var username = Team.getUsernameByMemberId(this.senderId);
      if (!this.isNotif() && username === '') {

        /**
         * @todo Please fix this shit boi.
         */
        $log.error('Empty username problem. Team members:',
          Team.getTeamMembers());
      }
      return username;
    };

    Message.prototype.getViewWellFormed = function () {
      var body = '';
      if (this.type === Message.TYPE.TEXT) {
        if (this.about) {
          body += '<a class="msg-attachment" ng-click="showFileLine(' +
            this.about.fileId + ',' + this.about.lineNumber + ',' +
            this.about.lineNumberTo +
            ')" tooltip-placement="top" uib-tooltip="در مورد...">';
          body += '<div><i class="zmdi zmdi-link"></i></div></a>';
        }
        body += Message.generateMessageWellFormedText(this.body);
      } else if (this.type === Message.TYPE.FILE) {
        this.canBeLived = fileUtil.isTextFormat(this.additionalData.type);
        body = '<div class="ng-scope" dir="rtl">';
        body += '<label class="file-name">' + this.additionalData.name +
          '</label>';
        body +=
          '<div class="file-icon-holder"><i class="fa fa-file"></i></div><br>';
        if (this.canBeLived) {
          body += '<a class="live-btn" dir="ltr" ng-click="goLive(' +
            this.additionalData.fileId + ', \'' + this.additionalData.name +
            '\')">';
          body += '<label dir="ltr">LIVE</label>';
          body += '<i class="fa fa-circle"></i>';
          body += '</a>';
          body += '<a class="dl-btn" ng-click="viewFile(' + this.additionalData
            .fileId +
            ')" tooltip-placement="top" uib-tooltip="مشاهده">';
          body += '<i class="fa fa-eye"></i>';
        }
        body += '<a class="dl-btn" href="' + this.additionalData.url +
          '" download="' + this.additionalData.name +
          '" target="_blank" tooltip-placement="top" uib-tooltip="دانلود">';
        body += '<i class="zmdi zmdi-download"></i>';

        body += '</a></div>';
        return body;
      } else if (this.type === Message.TYPE.NOTIF.USER_ADDED ||
        this.type === Message.TYPE.NOTIF.USER_REMOVED) {
        body = '';
        var addedMemberIds = this.additionalData;
        angular.forEach(addedMemberIds, function (memberId) {
          body += '@' + Team.getUsernameByMemberId(memberId) + ' و ';
        });
        body = body.slice(0, body.length - 3);
        if (this.type === Message.TYPE.NOTIF.USER_ADDED) {
          body += (addedMemberIds.length > 1) ?
            ' به گروه اضافه شدند.' : ' به گروه اضافه شد.';
        } else {
          body += (addedMemberIds.length > 1) ?
            ' از گروه حذف شدند.' : ' از گروه حذف شد.';
        }
      } else if (this.type === Message.TYPE.NOTIF.CHANNEL_CREATED) {
        body = 'گروه ساخته شد.';
      } else if (this.type === Message.TYPE.NOTIF.CHANNEL_EDITED) {
        body = 'اطلاعات گروه تغییر کرد.';
      } else if (this.type === Message.TYPE.NOTIF.FILE_LIVED) {
        body = 'فایل "' + this.additionalData.fileName + '"، ' +
          '<span class="live-btn"><label dir="ltr">LIVE</label>' +
          '<i class="fa fa-circle"></i></span>' + ' شد.';
      } else if (this.type === Message.TYPE.NOTIF.FILE_DIED) {
        body = 'فایل "' + this.additionalData.fileName + '"، از حالت ' +
          '<span class="live-btn"><label dir="ltr">LIVE</label>' +
          '<i class="fa fa-circle"></i></span>' + ' خارج شد.';
      }
      return body;
    };

    Message.prototype.isFromMe = function () {
      return this.senderId === CurrentMember.member.id;
    };

    Message.prototype.isEnglish = function () {
      return this.body ? textUtil.isEnglish(this.body) : false;
    };

    Message.prototype.getStyle = function () {
      if ((this.type === Message.TYPE.FILE) || this.isEnglish()) {
        return {
          'text-align': 'left',
          'direction': 'ltr'
        };
      } else {
        return {};
      }
    };

    Message.prototype.getStatus = function () {
      if (!this.channel) {
        this.channel = channelsService.findChannelById(this.channelId);
        if (!this.channel) {
          return Message.STATUS_TYPE.SEEN;
        }
      }
      if (this.isPending) {
        return Message.STATUS_TYPE.PENDING;
      }
      if (this.id <= this.channel.lastSeen) {
        return Message.STATUS_TYPE.SEEN;
      }
      return Message.STATUS_TYPE.SENT;
    };

    Message.prototype.getStatusIcon = function () {
      var status = this.getStatus();
      switch (status) {
      case Message.STATUS_TYPE.PENDING:
        return 'zmdi zmdi-time';
      case Message.STATUS_TYPE.SENT:
        return 'zmdi zmdi-check';
      case Message.STATUS_TYPE.SEEN:
        return 'zmdi zmdi-check-all';
      }
    };

    Message.prototype.getCssClass = function () {
      switch (this.type) {
      case Message.TYPE.TEXT:
        return this.isFromMe() ? 'msg msg-send' : 'msg msg-recieve';
      case Message.TYPE.FILE:
        return this.isFromMe() ? 'msg msg-send' : 'msg msg-recieve';
      case Message.TYPE.NOTIF.USER_ADDED:
        return 'notif';
      case Message.TYPE.NOTIF.USER_REMOVED:
        return 'notif';
      case Message.TYPE.NOTIF.FILE_LIVED:
        return 'notif';
      case Message.TYPE.NOTIF.FILE_DIED:
        return 'notif';
      case Message.TYPE.NOTIF.CHANNEL_CREATED:
        return 'notif';
      case Message.TYPE.NOTIF.CHANNEL_EDITED:
        return 'notif';
      }
    };

    Message.prototype.setIdAndDatetime = function (_id, datetime) {
      this._id = _id;
      this.id = Message.generateIntegerId(_id);
      this.datetime = new Date(datetime);
    };

    Message.generateIntegerId = function (stringId) {
      return parseInt(stringId.slice(stringId.lastIndexOf(':') + 1,
        stringId.length));
    };

    Message.prototype.getServerWellFormed = function () {
      var data = {
        channelId: this.channelId,
        teamId: this.teamId,
        messageBody: this.body,
        type: this.type
      };
      if (this.additionalData) {
        data.additionalData = this.additionalData;
      }
      if (this.about) {
        data.about = this.about;
      }
      return data;
    };

    Message.prototype.getDbWellFormed = function () {
      var data = {
        _id: this._id,
        id: this.id,
        body: this.body,
        senderId: this.senderId,
        channelId: this.channelId,
        datetime: this.datetime,
        type: this.type
      };
      if (this.additionalData) {
        data.additionalData = this.additionalData;
      }
      if (this.about) {
        data.about = this.about;
      }
      return data;
    };

    Message.prototype.save = function () {
      var that = this;
      db.getDb().then(function (database) {
        database.put(that.getDbWellFormed())
          .catch(function (err) {
            $log.error('Saving message failed.', err);
          });
      });
    };

    Message.generateMessageWellFormedText = function (text) {
      var wellFormedText = textUtil.htmlToPlaintext(text);
      wellFormedText = textUtil.urlify(wellFormedText);
      wellFormedText = textUtil.directionify(wellFormedText);
      wellFormedText = textUtil.codify(wellFormedText);
      // wellFormedText = textUtil.hashtagify(wellFormedText);
      return wellFormedText;
    };

    Message.prototype.isNotif = function () {
      return (this.type === Message.TYPE.NOTIF.USER_ADDED ||
        this.type === Message.TYPE.NOTIF.USER_REMOVED ||
        this.type === Message.TYPE.NOTIF.FILE_LIVED ||
        this.type === Message.TYPE.NOTIF.CHANNEL_CREATED ||
        this.type === Message.TYPE.NOTIF.CHANNEL_EDITED ||
        this.type === Message.TYPE.NOTIF.FILE_DIED);
    };

    Message.prototype.getLocaleDate = function () {
      return dateUtil.getPersianDateString(this.datetime);
    };


    Message.TYPE = {
      TEXT: 0,
      FILE: 1,
      NOTIF: {
        USER_ADDED: 2,
        USER_REMOVED: 3,
        FILE_LIVED: 4,
        CHANNEL_CREATED: 5,
        CHANNEL_EDITED: 6,
        FILE_DIED: 7
      }
    };

    Message.STATUS_TYPE = {
      PENDING: 0,
      SENT: 1,
      SEEN: 2
    };

    return Message;

  }
]);
