'use strict';


app.service('db', ['$window', '$log', 'User', function ($window, $log, User) {

  var self = this;

  if (!User.exists()) return;
  createDb();

  function createDb() {
    self.db = new $window.PouchDB('tecom:' + User.team.id);
    $log.info('PouchDB created successfuly.');
    self.db.createIndex({
      index: {
        fields: ['id', 'channelId']
      }
    });
  }

  function getDb() {
    return self.db;
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
