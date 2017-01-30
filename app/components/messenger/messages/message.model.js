'use strict';

app.factory('Message', [
  '$log', 'db', 'textUtil', 'channelsService', 'User',
  function ($log, db, textUtil, channelsService, User) {

    function Message(body, type, senderId, channelId, _id, datetime,
      additionalData, isPending) {
      this.setValues(body, type, senderId, channelId, _id, datetime,
        additionalData, isPending);
    }

    Message.prototype.setValues = function (body, type, senderId, channelId,
      _id, datetime, additionalData, isPending) {
      this.body = body;
      this.type = type;
      this.senderId = senderId;
      this.channelId = channelId;
      this._id = _id || null;
      this.datetime = datetime ? new Date(datetime) : new Date();
      this.additionalData = additionalData || null;
      if (this._id) {
        this.id = Message.generateIntegerId(_id);
      }
      this.isPending = isPending || false;
      this.username = User.team.getUsernameById(this.senderId);
    };

    Message.prototype.getViewWellFormed = function () {
      var body;
      if (this.type === Message.TYPE.TEXT) {
        body = Message.generateMessageWellFormedText(this.body);
      } else if (this.type === Message.TYPE.FILE) {
        body = '<label>' + this.additionalData.name + '</label>';
        body += '<br>';
        body += '<a ng-click="goLive(' + this.additionalData.fileId + ')" tooltip-placement="bottom" uib-tooltip="Go Live!">';
        body += '<i class="fa fa-eye"></i>';
        body += '</a>';
        body += '<a href=\"' + this.additionalData.url + '" download="' +
          this.additionalData.name + '" target="_blank" tooltip-placement="bottom" uib-tooltip="دانلود">';
        body += '<i class="fa fa-download"></i>';
        body += '</a>';
        return body;
      } else if (this.type === Message.TYPE.NOTIF.USER_ADDED ||
        this.type === Message.TYPE.NOTIF.USER_REMOVED) {
        body = '';
        var addedMemberIds = this.additionalData;
        angular.forEach(addedMemberIds, function (memberId) {
          body += '@' + User.team.getUsernameById(memberId) + ' و ';
        });
        body = body.slice(0, body.length - 3);
        if (this.type === Message.TYPE.NOTIF.USER_ADDED) {
          body += (addedMemberIds.length > 1) ?
            '.به گروه اضافه شدند.' : ' به گروه اضافه شد';
        } else {
          body += (addedMemberIds.length > 1) ?
            '.از گروه حذف شدند.' : ' از گروه حذف شد';
        }
      }
      return body;
    };

    Message.prototype.isFromMe = function () {
      return this.senderId === User.id;
    };

    Message.prototype.isEnglish = function () {
      return this.body ? textUtil.isEnglish(this.body) : false;
    };

    Message.prototype.getStyle = function () {
      if (this.type === Message.TYPE.FILE || this.isEnglish()) {
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
          return 'msg msg-file';
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
        messageBody: this.body,
        type: this.type
      };
      if (this.additionalData) {
        data.additionalData = this.additionalData;
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
      var wellFormedText;
      wellFormedText = textUtil.htmlToPlaintext(text);
      wellFormedText = textUtil.urlify(wellFormedText);
      // wellFormedText = textUtil.hashtagify(wellFormedText);
      return wellFormedText;
    };

    Message.TYPE = {
      TEXT: 0,
      FILE: 1,
      NOTIF: {
        USER_ADDED: 2,
        USER_REMOVED: 3,
        FILE_LIVED: 4
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
