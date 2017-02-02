var MongoClient = require('mongodb').MongoClient;
var _db;

module.exports = {

  connect: function(callback) {
    MongoClient.connect( "mongodb://localhost:27017/testdb", function(err, db) {
      _db = db;
      callback(err, _db);
    });
  },

  getInstance: function() {
    if(_db) {
      console.log('success');
      return _db;
    }
    else {
      console.log('error exporting an instance');
    }
  },

  getMessages: function(callback) {
    if(_db) {
      var collection = _db.collection('messages').find().toArray(function(err, data) {
        return data;
      });
    }
    else {
      callback('DB not loaded yet');
    }
  }
};
