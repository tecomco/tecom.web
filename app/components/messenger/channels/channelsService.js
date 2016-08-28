'use strict';

app.service('channelsService', ['socket', function (socket) {

    var channels;
    socket.on('init', function(data){
        // console.log(data);
        channels = data.channels;
    });

    var people = [
        {
            name: 'محسن',
            id: 'mohsen',
            online: true
        },
        {
            name: 'آرین',
            id: 'arian',
            online: false
        },
        {
            name: 'کیارش',
            id: 'kiarash',
            online: true
        }];

    return {
        getChannels: function () {
            return channels
        },

        getPeople: function () {
            return people
        }
    }
}]);
