'use strict';


app.service('db', ['$window', '$localStorage', function ($window, $localStorage) {

  var db = new $window.PouchDB('Testtttt');

  return {
    getDb: function () {
      return db;
    },
    saveMessage: function (message) {
      db.put(message, function (err) {
        if (err) {
          console.log('Error Caching message:', err);
        }
      });
    },
    loadChannelMessages: function (channelId, callback) {
      db.createIndex({
        index: {
          fields: ['id', 'channelId']
        }
      });
      db.find({
        selector: {
          id: {$gt: null},
          channelId: {$eq: channelId}
        },
        sort: [{id: 'desc'}],
        limit: 5
      }).then(function (result) {
        callback(result.docs);
      });
    },
    destroy: function () {
      db.destroy().then(function (response) {
        console.log("Database Cleared Succesfully.");
      }).catch(function (err) {
        console.log("Error Clearing Database: ", err);
      });
    }
  };
}]);