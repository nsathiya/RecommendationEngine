var express = require('express');
var logger = require('morgan');

var index = require('./routes/index');
var db = require('./utilities/database/dbUtils');
var handler = require('./handlers/recommendations.js');
var app = express();

app.use(logger('dev'));
app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Connect to Mongo on start
console.log('Connecting to Mongo...');
db.connect(process.env.MONGO_URL, function(err) {
  if (err) {
    console.log('Unable to connect to Mongo.', err);
    process.exit(1)
  } else {

    handler.startSetupProcess(function(err, result){
      if (err){
        console.log('Unable to correctly setup...');
      } else {
        console.log(result);
        console.log('Starting server...');
        app.listen(3000, function() {
          console.log('Listening on port 3000...')
        })
      }   
    })
   
  }
})

module.exports = app;
