'use strict';

app.factory('Message', ['$log', '$stateParams', '$localStorage', '$sce', 'db',
  'textUtil', 'User',
  function ($log, $stateParams, $localStorage, $sce, db, textUtil, User) {

    var findChannelCallback;

    function Message(body, type, senderId, channelId, _id, datetime, additionalData) {
      this.body = body;
      this.type = type;
      this.senderId = senderId;
      this.channelId = channelId;
      this.isPending = false;
      this.datetime = datetime ? new Date(datetime) : new Date();
      this._id = _id || null;
      if (this._id) {
        this.id = Message.generateIntegerId(_id);
      }
      this.username = User.team.getUsernameById(this.senderId);
      this.additionalData = additionalData || null;
    }

    Message.prototype.getViewWellFormed = function () {
      if (this.type === Message.TYPE.TEXT) {
        return Message.generateMessageWellFormedText(this.body);
      }
      else if (this.type === Message.TYPE.NOTIF.USER_ADDED ||
        this.type === Message.TYPE.NOTIF.USER_REMOVED) {
        var body = '';
        var addedMemberIds = this.additionalData;
        angular.forEach(addedMemberIds, function (memberId) {
          body += '@' + User.team.getUsernameById(memberId) + ' و ';
        });
        body = body.slice(0, body.length - 3);
        if (this.type === Message.TYPE.NOTIF.USER_ADDED)
          body += (addedMemberIds.length > 1) ?
            ' به گروه اضافه شدند.' : ' به گروه اضافه شد';
        else
          body += (addedMemberIds.length > 1) ?
            ' از گروه حذف شدند.' : ' از گروه حذف شد';
        return body;
      }
    };

    Message.prototype.isFromMe = function () {
      return this.senderId === User.id;
    };

    Message.prototype.isEnglish = function () {
      if (this.body)
        return textUtil.isEnglish(this.body);
      return false;
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
      var channelLastSeen = findChannelCallback(this.channelId).channelLastSeen;
      if (this.isPending)
        return Message.STATUS_TYPE.PENDING;
      if (this.id <= channelLastSeen)
        return Message.STATUS_TYPE.SEEN;
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
        case Message.TYPE.TEXT :
          return User.id === this.senderId ? 'msg msg-send' : 'msg msg-recieve';
          break;
        case Message.TYPE.NOTIF.USER_ADDED :
          return User.id === this.senderId ? 'msg msg-send' : 'msg msg-recieve';
          break;
        case Message.TYPE.NOTIF.USER_REMOVED :
          return User.id === this.senderId ? 'msg msg-send' : 'msg msg-recieve';
          break;
        case Message.TYPE.NOTIF.FILE_LIVED :
          return 'msg msg-file';
          break;
      }
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
      var json = {
        _id: this._id,
        id: this.id,
        body: this.body,
        senderId: this.senderId,
        channelId: this.channelId,
        datetime: this.datetime,
        type: this.type
      };
      if (this.additionalData)
        json.additionalData = this.additionalData;
      return json;
    };

    Message.prototype.save = function () {
      db.getDb().put(this.getJson())
        .catch(function (err) {
          $log.error('Error saving message.', err);
        });
    };

    Message.generateMessageWellFormedText = function (text) {
      var wellFormedText;
      wellFormedText = textUtil.urlify(text);
      // wellFormedText = textUtil.hashtagify(text);
      return $sce.trustAsHtml(wellFormedText);
    };

    Message.bulkSave = function (messages) {
      var messageObjects = [];
      messages.forEach(function (message) {
        messageObjects.push(message.getJson());
      });
      db.getDb().bulkDocs(messageObjects)
        .catch(function (err) {
          $log.error('Error bulking messages.', err);
        });
    };

    Message.findStatus = function (id, channelLastSeen, notifCount) {
      if (channelLastSeen) {
        return (id > channelLastSeen) ?
          Message.STATUS_TYPE.SENT : Message.STATUS_TYPE.SEEN;
      }
      else
        return Message.STATUS_TYPE.SENT;
    };

    Message.setFindChannelCallback = function (findChannelFunc) {
      findChannelCallback = findChannelFunc;
    };

    Message.TYPE = {
      TEXT: 0,
      FILE: 1,
      NOTIF: {USER_ADDED: 2, USER_REMOVED: 3, FILE_LIVED: 4}
    };

    Message.STATUS_TYPE = {
      PENDING: 0,
      SENT: 1,
      SEEN: 2
    };

    return Message;

  }
]);
