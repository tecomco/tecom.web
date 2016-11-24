'use strict';

/*app.service('db', function(pouchDB) {
  var db = new pouchDB('myDB');

  var data = {name: 'mohsen'};
  db.info().then(function (info) {
    console.log(info);
  });

  function error(err) {
    // $log.error(err);
  }

  function get(res) {
    if (!res.ok) {
      return error(res);
    }
    return db.get(res.id);
  }

  function bind(res) {
    data = res;
    console.log(data);
    console.log(res);
    console.log(db);
  }

  return{
    getDb: function(){
      return db;
    },
    post: function(){
      db.post(data)
        .then(get)
        .then(bind)
        .catch(error);
    }
  };
});*/