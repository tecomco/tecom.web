'use strict';


app.service('db', ['$window', '$localStorage', function ($window, $localStorage) {

  var db = new $window.PouchDB('Testtttt');
  db.createIndex({
    index: {
      fields: ['id', 'channelId']
    }
  });
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
      db.find({
        selector: {
          id: {$gt: null},
          channelId: {$eq: channelId}
        },
        sort: [{id: 'desc'}],
        limit: 50
      }).then(function (result) {
        callback(result.docs);
      });
    },
    getLastChannelMessage: function(channelId, callback){
      db.find({
        selector: {
          id: {$gt: null},
          channelId: {$eq: channelId}
        },
        sort: [{id: 'desc'}],
        limit: 1
      }).then(function (result) {
        if(result.docs.length === 0)
          callback(null);
        else
          callback(result.docs[0]);
      });
    },
    destroy: function () {
      db.destroy().then(function (response) {
        console.log("Database Cleared Succesfully.");
      }).catch(function (err) {
        console.log("Error Clearing Database: ", err);
      });
    },
  };
}]);