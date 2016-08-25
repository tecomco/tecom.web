'use strict';

app.service('channelsService', function () {

    var channels = [
        {
            name: 'تیکام',
            id: 'tecom'
        },
        {
            name: 'کدمد',
            id: 'codmod'
        },
        {
            name: 'گوگل',
            id: 'google'
        },
        {
            name: 'فیسبوک',
            id: 'facebook'
        }];

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
})