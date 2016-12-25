'use strict';

app.factory('Message', ['$log', '$stateParams', '$localStorage', '$sce', 'db',
  'textUtil', 'User',
  function ($log, $stateParams, $localStorage, $sce, db, textUtil, User) {

    var findChannelCallback;

    function Message(body, senderId, channelId, status, _id, datetime) {
      this.body = body;
      this.senderId = senderId;
      this.channelId = channelId;
      this.isPending = false;
      this.datetime = datetime ? new Date(datetime) : new Date();
      this._id = _id || null;
      if (this._id) {
        this.id = Message.generateIntegerId(_id);
      }
      this.username = User.team.getUsernameById(this.senderId);
    }

    Message.prototype.getViewWellFormed = function () {
      return Message.generateMessageWellFormedText(this.body);
    };

    Message.prototype.isFromMe = function () {
      return this.senderId === User.id;
    };

    Message.prototype.isEnglish = function () {
      return textUtil.isEnglish(this.body);
    };

    Message.prototype.getStatus = function () {
      var channelLastSeen = findChannelCallback(this.channelId).channelLastSeen;
      if(this.isPending)
        return Message.STATUS_TYPE.PENDING;
      if(this.id <= channelLastSeen)
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
        datetime: this.datetime
      };
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

    Message.STATUS_TYPE = {
      PENDING: 0,
      SENT: 1,
      SEEN: 2
    };

    Message.setFindChannelCallback = function(findChannelFunc){
      findChannelCallback = findChannelFunc;
    };


    return Message;

  }
]);
