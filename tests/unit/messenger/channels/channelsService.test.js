'use strict';

describe('channelsService', function () {

  beforeEach(function () {
    module('tecomApp');
  });


  describe('getChannels', function () {
    it('should return json of channels', inject(function (channelsService) {
      expect(channelsService.getChannels()[0].name).toBe('تیکام');
      expect(channelsService.getChannels()[0].id).toBe('tecom');
      expect(channelsService.getChannels()[1].name).toBe('کدمد');
      expect(channelsService.getChannels()[1].id).toBe('codmod');
    }))
  });
})
