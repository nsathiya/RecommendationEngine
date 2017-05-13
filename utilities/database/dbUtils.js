var MongoClient = require('mongodb').MongoClient;
var state = {
  db: null,
}

var connect = function(url, cb) {
  if (state.db) return cb()

  MongoClient.connect(url, function(err, db) {
    if (err) return cb(err)
    state.db = db
    cb()
  })
}

var get = function(cb){
  if (state.db)
    return (state.db);
}

module.exports.connect = connect;
module.exports.get = get;
