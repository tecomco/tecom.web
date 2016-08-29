'use strict';

app.service('messagesService', [function () {

    var messages = [];

    return {
        getMessages: function () {
            for (var i = 0; i < 100; i++) {
                messages[i] = {
                    body: 'سلام عجقم من پیام شماره ' + i + ' هستم',
                    sender: (i % 2 === 0 ? 'نفسم' : 'زندگیم'),
                    dateTime: '۵:۳۸',
                    seen: false
                };
            }
            return messages;
        }
    };
}]);
