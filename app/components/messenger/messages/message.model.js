'use strict';

app.factory('Message', [
  '$log', 'ENV', 'Db', '$timeout', 'textUtil', 'channelsService', 'fileUtil',
  'dateUtil', 'CurrentMember', 'Team',
  function ($log, ENV, Db, $timeout, textUtil, channelsService, fileUtil,
    dateUtil, CurrentMember, Team) {

    function Message(body, type, senderId, channelId, _id, datetime,
      additionalData, about, replyTo, isPending, timestamp) {
      this.setValues(body, type, senderId, channelId, _id, datetime,
        additionalData, about, replyTo, isPending, timestamp);
    }

    Message.prototype.setValues = function (body, type, senderId, channelId,
      _id, datetime, additionalData, about, replyTo, isPending,
      timestamp) {
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
      this.isFailed = false;
      this.currentChannel = channelsService.getCurrentChannel();
      if (this.currentChannel) {
        this.teamId = this.currentChannel.teamId;
      }
      this.timestamp = timestamp || null;
      this.uploadProgressBar = null;
      this.replyTo = replyTo;
    };

    Message.prototype.getUsername = function () {
      if (this.isLoading() || this.isNotif()) return '';
      return Team.getUsernameByMemberId(this.senderId);
    };

    Message.prototype.getUsernameColor = function () {
      if (CurrentMember.member.isTecomBot() || !this.senderId ||
        this.senderId === CurrentMember.member.id) {
        return {};
      }
      var member = Team.getMemberByMemberId(this.senderId);
      return {
        color: member.user.usernameColor
      };
    };

    Message.prototype.getViewWellFormed = function () {
      var body;
      if (this.type === Message.TYPE.TEXT)
        body = this.generateTextBody();
      else if (this.isFile())
        body = this.generateFileBody();
      else
        body = this.generateMessageNotifTypeBody();
      return body;
    };

    Message.prototype.isFromMe = function () {
      return this.senderId === CurrentMember.member.id;
    };

    Message.prototype.isEnglish = function () {
      return this.body ? textUtil.isEnglish(this.body) : false;
    };

    Message.prototype.isLoading = function () {
      return this.type === Message.TYPE.LOADING;
    };

    Message.prototype.getStyle = function () {
      if ((this.isFile()) || this.isEnglish()) {
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
      if (this.isFailed) {
        return Message.STATUS_TYPE.FAILED;
      }
      if (this.isPending) {
        return Message.STATUS_TYPE.PENDING;
      }
      if (this.id <= this.channel.lastSeenId) {
        return Message.STATUS_TYPE.SEEN;
      }
      return Message.STATUS_TYPE.SENT;
    };

    Message.prototype.getFileTimestampId = function () {
      return 'msg-' + this.timestamp;
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
        case Message.STATUS_TYPE.FAILED:
          return 'zmdi zmdi-alert-circle-o';
      }
    };

    Message.prototype.getCssClass = function () {
      switch (this.type) {
        case Message.TYPE.TEXT:
          if (this.isFromMe()) {
            if (this.about) {
              return 'msg msg-send msg-has-attachment';
            } else {
              return 'msg msg-send';
            }
          } else {
            if (this.about) {
              return 'msg msg-recieve msg-has-attachment';
            } else {
              return 'msg msg-recieve';
            }
          }
          break;
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
        case Message.TYPE.LOADING:
          return 'msg-loading';
      }
    };

    Message.prototype.getReplyMessageBody = function () {
      switch (this.type) {
        case Message.TYPE.TEXT:
          return this.body;
        case Message.TYPE.FILE:
          return this.additionalData.name;
        case Message.TYPE.NOTIF.USER_ADDED:
          return this.generateUserNotifBody();
        case Message.TYPE.NOTIF.USER_REMOVED:
          return this.generateUserNotifBody();
        case Message.TYPE.NOTIF.FILE_LIVED:
          return 'فایل "' + this.additionalData.fileName + '"، LIVE شد.';
        case Message.TYPE.NOTIF.FILE_DIED:
          return 'فایل "' + this.additionalData.fileName +
            '"، از حالت LIVE خارج شد.';
        case Message.TYPE.NOTIF.CHANNEL_CREATED:
          return 'گروه ساخته شد.';
        case Message.TYPE.NOTIF.CHANNEL_EDITED:
          return 'اطلاعات گروه تغییر کرد.';
      }
    };

    Message.prototype.getMessageHighlightClass = function () {
      if (this.isHighlighted)
        return 'msg-highlight';
      return '';
    };

    Message.prototype.highlight = function () {
      this.isHighlighted = true;
      var that = this;
      $timeout(function () {
        that.isHighlighted = false;
      }, 1500);
    };

    Message.prototype.setIdAndDatetime = function (_id, datetime) {
      this._id = _id;
      this.id = Message.generateIntegerId(_id);
      this.datetime = new Date(datetime);
    };

    Message.prototype.setId = function (id) {
      this.id = id;
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
        type: this.type,
        replyTo: this.replyTo
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
        type: this.type,
        replyTo: this.replyTo
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
      Db.getDb()
        .then(function (database) {
          database.put(that.getDbWellFormed())
            .catch(function (err) {
              $log.error('Saving message failed.', err);
            });
        });
    };

    Message.generateMessageWellFormedText = function (text) {
      var wellFormedText = textUtil.htmlToPlaintext(text);
      wellFormedText = textUtil.htmlify(wellFormedText);
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

    Message.prototype.isFile = function () {
      return this.type === Message.TYPE.FILE;
    };

    Message.prototype.getSenderImageByMemberId = function () {
      return Team.getImageByMemberId(this.senderId);
    };

    Message.prototype.getLocaleDate = function () {
      return dateUtil.getPersianDateString(this.datetime);
    };

    Message.prototype.getLocaleTime = function () {
      return dateUtil.getPersianTime(this.datetime);
    };

    Message.prototype.isImage = function () {
      var type = this.additionalData.type ||
        this.additionalData.name.split('.').pop();
      return fileUtil.isPictureFormat(type);
    };

    Message.prototype.generateTextBody = function () {
      var body = '';
      if (this.about) {
        body += '<a class="msg-attachment" ng-click="showFileLine(' +
          this.about.fileId + ',' + this.about.lineNumber + ',' +
          this.about.lineNumberTo +
          ')" tooltip-placement="top" uib-tooltip="در مورد...">';
        body += '<div><i class="zmdi zmdi-link"></i></div></a>';
      }
      body += Message.generateMessageWellFormedText(this.body);
      return body;
    };

    Message.prototype.generateFileBody = function () {
      var body = '';
      this.canBeLived = fileUtil.isTextFormat(this.additionalData.type);
      body = '<div id="' + this.getFileTimestampId() +
        '" class="ng-scope" dir="rtl">';
      if (this.isImage())
        body += this.generateImageViewerBody();
      else
        body += this.generateFileMessageBody();
      if (this.canBeLived)
        body += this.generateFileLiveAndViewBody();
      if (!this.isFailed)
        body += this.generateFileDownloadBody();
      body += '</div>';
      return body;
    };

    Message.prototype.generateImageViewerBody = function () {
      return '<div class="msg-img" ng-if="' + !this.isPending +
        '" ng-click="fullscreenImage(\'' + this.additionalData.url +
        '\', \'' + this.additionalData.name +
        '\')"><img class="img-responsive " id="img-' + this.additionalData
        .fileId + '" ng-src="' + ENV.staticUri + this.additionalData.url +
        '" style="cursor:pointer" /></div>';
    };

    Message.prototype.generateFileMessageBody = function () {
      return '<label class="file-name">' + this.additionalData.name +
        '</label>' +
        '<div class="file-icon-holder"><i class="fa fa-file"></i></div><br>';
    };

    Message.prototype.generateFileLiveAndViewBody = function () {
      var body = '';
      if (this.currentChannel.canMemberSendMessage()) {
        body += '<a class="live-btn" dir="ltr" ng-click="goLive(' +
          this.additionalData.fileId + ', \'' + this.additionalData.name +
          '\')">';
        body += '<label dir="ltr">LIVE</label>';
        body += '<i class="fa fa-circle"></i>';
        body += '</a>';
      }
      body += '<a class="dl-btn" ng-click="viewFile(' + this.additionalData
        .fileId +
        ')" tooltip-placement="top" uib-tooltip="مشاهده">';
      body += '<i class="fa fa-eye"></i>';
      return body;
    };

    Message.prototype.generateFileDownloadBody = function () {
      return '<a class="dl-btn" ng-if="' + !this.isPending + '" href="' +
        this.additionalData.url + '" download="' + this.additionalData.name +
        '" target="_blank" tooltip-placement="top" uib-tooltip="دانلود">' +
        '<i class="zmdi zmdi-download"></i></a>';
    };

    Message.prototype.generateMessageNotifTypeBody = function () {
      var body = '';
      if (this.type === Message.TYPE.NOTIF.USER_ADDED ||
        this.type === Message.TYPE.NOTIF.USER_REMOVED) {
        body = this.generateUserNotifBody(body);
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
      } else if (this.type === Message.TYPE.LOADING) {
        body = '<div class="cssload-container">' +
          '<div class="loading-text">در حال بارگذاری...</div></div>';
      }
      return body;
    };

    Message.prototype.generateUserNotifBody = function () {
      var body = '';
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
      return body;
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
      },
      LOADING: 8
    };

    Message.STATUS_TYPE = {
      PENDING: 0,
      SENT: 1,
      SEEN: 2,
      FAILED: 3
    };

    return Message;

  }
]);
