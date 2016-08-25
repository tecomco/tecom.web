'use strict';

describe('channelsService', function () {

    beforeEach(function () {
        module("tecomApp");
    })

    describe('getChannels', function () {

        it('should return json of channels', inject(function (channelsService) {
            expect(channelsService.getChannels()[0].name).toBe('تیکام');
            expect(channelsService.getChannels()[0].id).toBe('tecom');
            expect(channelsService.getChannels()[1].name).toBe('کدمد');
            expect(channelsService.getChannels()[1].id).toBe('codmod');
        }))
    })

    describe('getPeople', function () {

        it('should return json of people', inject(function (channelsService) {
            expect(channelsService.getPeople()[0].name).toBe('محسن');
            expect(channelsService.getPeople()[0].id).toBe('mohsen');
            expect(channelsService.getPeople()[0].online).toBe(true);
            expect(channelsService.getPeople()[1].name).toBe('آرین');
            expect(channelsService.getPeople()[1].id).toBe('arian');
            expect(channelsService.getPeople()[1].online).toBe(false);
        }))
    })
})
