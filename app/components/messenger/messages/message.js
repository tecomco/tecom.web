'use strict';

app.factory('Message', ['$localStorage', function ($localStorage) {

  function Message(id, body, sender, channelId, status) {
    this.id = id;
    this.body = body;
    this.sender = sender;
    this.channelId = channelId;
    this.status = status || Message.STATUS_TYPE.PENDING;
    this.datetime = new Date();
  }

  Message.prototype.isFromMe = function () {
    return this.sender === $localStorage.decodedToken.memberships[0].username;
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
    var username = $localStorage.decodedToken.memberships[0].username;
    return username === this.sender ? 'msg msg-send' : 'msg msg-recieve';
  };

  Message.prototype.getServerWellFormed = function () {
    return {
      channelId: this.channelId,
      messageBody: this.body
    };
  };

  Message.STATUS_TYPE = {
    PENDING: 0,
    SENT: 1,
    DELIVERED: 2,
    SEEN: 3
  };

  return Message;

}]);
