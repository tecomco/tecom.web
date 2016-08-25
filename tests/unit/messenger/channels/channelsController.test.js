'use strict';

describe('channelsController', function () {

    var mockChannelsService;
    var scope, $controllerConstructor, stateParams;

    beforeEach(function () {
        module("tecomApp");
    })

    beforeEach(function () {
        mockChannelsService = sinon.stub({
            getChannels: function () {
            },
            getPeople: function () {
            }
        });
        module(function ($provide) {
            $provide.value('channelsService', mockChannelsService);
        })
    })

    beforeEach(inject(function ($controller, $rootScope, $stateParams) {
        $controllerConstructor = $controller;
        scope = $rootScope.$new();
        stateParams = $stateParams;
    }));

    describe('selectedChat', function () {
        it('should return selectedChat according to stateParams value', function () {
            var controller = $controllerConstructor("channelsController", {$scope: scope, $stateParams: {chatId: "Tecom"}});
            expect(scope.selectedChat()).toBe('Tecom');
        })
    })

    describe('channels', function () {
        it('should set channels according to retrieved data from service', function () {
            var mockChannelsData = [
                {
                    name: 'mock_channel_name',
                    id: 'mock_channel_id'
                }
            ];
            mockChannelsService.getChannels.returns(mockChannelsData);
            var controller = $controllerConstructor("channelsController", {
                $scope: scope
            });
            expect(scope.channels).toBe(mockChannelsData);
        })
    })

    describe('people', function () {
        it('should set people according to retrieved data from service', function () {
            var mockPeopleData = [
                {
                    name: 'mock_people_name',
                    id: 'mock_people_id',
                    online: 'mock_people_online'
                }
            ];
            mockChannelsService.getPeople.returns(mockPeopleData);
            var controller = $controllerConstructor("channelsController", {
                $scope: scope
            });
            expect(scope.people).toBe(mockPeopleData);
        })
    })
})
