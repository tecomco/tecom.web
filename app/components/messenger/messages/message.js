'use strict';

app.factory('Message', ['$log', 'db', 'User', function ($log, db, User) {

    function Message(body, senderId, channelId, status, _id, datetime) {
      this.body = body;
      this.senderId = senderId;
      this.channelId = channelId;
      this.status = status || Message.STATUS_TYPE.PENDING;
      this.datetime = datetime ? new Date(datetime) : new Date();
      this._id = _id || null;
      if (this._id) {
        this.id = Message.generateIntegerId(_id);
      }
      this.username = User.team.getUsernameById(this.senderId);
    }

    Message.prototype.isFromMe = function () {
      return this.senderId === User.id;
    };

    Message.prototype.isEnglish = function () {
      var english = /^[A-Za-z0-9]*$/;
      return english.test(this.body);
    };

    Message.prototype.getStatusIcon = function () {
      switch (this.status) {
      case Message.STATUS_TYPE.PENDING:
        return 'zmdi zmdi-time';
      case Message.STATUS_TYPE.SENT:
        return 'zmdi zmdi-check';
      case Message.STATUS_TYPE.DELIVERED:
        return 'zmdi zmdi-ckeck-all';
      case Message.STATUS_TYPE.SEEN:
        return 'zmdi zmdi-eye';
      }
    };

    Message.prototype.getCssClass = function () {
      return User.id === this.senderId ? 'msg msg-send' : 'msg msg-recieve';
    };

    Message.prototype.updateIdAndDatetime = function (_id, datetime) {
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

    Message.prototype.getJson = function () {
      return {
        _id: this._id,
        id: this.id,
        body: this.body,
        senderId: this.senderId,
        channelId: this.channelId,
        status: this.status,
        datetime: this.datetime
      };
    };

    Message.prototype.save = function () {
      db.getDb().put(this.getJson(), function (err) {
        if (err) {
          $log.error('Error saving message.', err);
        }
      });
    };

    Message.STATUS_TYPE = {
      PENDING: 0,
      SENT: 1,
      DELIVERED: 2,
      SEEN: 3
    };

    return Message;

  }
]);
