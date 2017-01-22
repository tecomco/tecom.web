'use strict';

app.factory('Message',
  ['$log', '$sce', 'db', 'textUtil', 'channelsService', 'User',
  function ($log, $sce, db, textUtil, channelsService, User) {

    function Message(body, type, senderId, channelId, _id, datetime,
      additionalData, isPending) {
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
    }

    Message.prototype.getViewWellFormed = function () {
      if (this.type === Message.TYPE.TEXT) {
        return Message.generateMessageWellFormedText(this.body);
      } else if (this.type === Message.TYPE.NOTIF.USER_ADDED ||
        this.type === Message.TYPE.NOTIF.USER_REMOVED) {
        var body = '';
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
        return body;
      }
    };

    Message.prototype.isFromMe = function () {
      return this.senderId === User.id;
    };

    Message.prototype.isEnglish = function () {
      return this.body ? textUtil.isEnglish(this.body) : false;
    };

    Message.prototype.getStyle = function () {
      if (this.isEnglish()) {
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
          return User.id === this.senderId ? 'msg msg-send' : 'msg msg-recieve';
        case Message.TYPE.NOTIF.USER_ADDED:
          return User.id === this.senderId ? 'msg msg-send' : 'msg msg-recieve';
        case Message.TYPE.NOTIF.USER_REMOVED:
          return User.id === this.senderId ? 'msg msg-send' : 'msg msg-recieve';
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
      return {
        channelId: this.channelId,
        messageBody: this.body
      };
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
      wellFormedText = textUtil.urlify(text);
      // wellFormedText = textUtil.hashtagify(text);
      return $sce.trustAsHtml(wellFormedText);
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
