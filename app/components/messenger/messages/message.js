'use strict';

app.factory('Message', ['$log', 'db', 'User', 'Team',
  function ($log, db, User, Team) {

    function Message(body, senderId, channelId, status, _id, id, datetime) {
      this.body = body;
      this.senderId = senderId;
      this.channelId = channelId;
      this.status = status || Message.STATUS_TYPE.PENDING;
      this.datetime = datetime ? new Date(datetime) : new Date();
      this._id = _id || null;
      this.id = id || null;
    }

    Message.prototype.isFromMe = function () {
      return this.senderId === User.id;
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

    Message.prototype.getUsername = function () {
      return Team.getUserById(this.senderId);
    };

    Message.prototype.updateIdAndDatetime = function (data) {
      this._id = data.id;
      this.id = parseInt(data.id.slice(data.id.lastIndexOf(':') + 1,
        data.id.length));
      this.datetime = new Date(data.datetime);
    };

    Message.prototype.setId = function () {
      this.id = parseInt(this._id.slice(this._id.lastIndexOf(':') + 1,
        this._id.length));
    };

    Message.prototype.findId = function () {
      return parseInt(this._id.slice(this._id.lastIndexOf(':') + 1,
        this._id.length));
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
      db.saveMessage(this.getJson());
    };

    Message.STATUS_TYPE = {
      PENDING: 0,
      SENT: 1,
      DELIVERED: 2,
      SEEN: 3
    };

    return Message;

  }]);
