'use strict';


app.service('Db', ['$window', '$q', '$log', 'CurrentMember','Team',
  function ($window, $q, $log, CurrentMember, Team) {

  var self = this;

  if (!CurrentMember.exists()) return;
  createDb();

  function createDb() {
    self.db = new $window.PouchDB('tecom:' + Team.id + ':' +
      CurrentMember.member.id);
    $log.info('PouchDB connected successfuly.');
    self.createIndexPromise = self.db.createIndex({
      index: {
        fields: ['id', 'channelId']
      }
    });
  }

  function getDb() {
    var deferred = $q.defer();
    if (self.isIndexReady) {
      deferred.resolve(self.db);
    } else {
      self.createIndexPromise.then(function () {
        deferred.resolve(self.db);
        self.isIndexReady = true;
      });
    }
    return deferred.promise;
  }

  function destroy() {
    self.db.destroy().then(function (response) {
      $log.info('Database cleared succesfully.');
    }).catch(function (err) {
      $log.error('Error clearing database.', err);
    });
  }

  return {
    getDb: getDb,
    destroy: destroy
  };

}]);
