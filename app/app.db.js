'use strict';

app.service('dataBase', function(pouchDB) {
  var db = pouchDB('myDB');
  var data = {name: 'mohsen'};

  function error(err) {
    $log.error(err);
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
  }
});