var express = require('express');
var app = express();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var xssFilter = require('xss-filters');
var port = 8080;

var mongo = require('./models/mongo');

mongo.connect(function(err, db) {
  
  var messages = db.collection('messages');  

  app.use(express.static(__dirname + '/public'));

  app.get('/', function (req, res) {
    console.log('index requested ', req.url);
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });

  io.on('connection', function(socket) {
    console.log('user connected via websocket');

    messages.find().toArray(function(err, data) {
      for(i = 0; i < data.length; i++) {
        console.log(data[i]);
      }
      socket.emit('chathistory', data);
    });


    socket.on('disconnect', function() {
      console.log('user disconnected');
    });

    socket.on('message', function (data) {
      timestamp = Date.now();
      var message = {
        timestamp : timestamp,
        username : xssFilter.inHTMLData(data.username),
        message : xssFilter.inHTMLData(data.message)
      };

      console.log('received message from client. broadcasting..');
      io.emit('broadcast', [message]);

      messages.save(message);
    });
  });

  app.use(function (req, res, next) {
    console.error('404: requsted url ' + req.url);
    res.status(400).sendFile(path.join(__dirname, 'public', '404.html'));
  });

  app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500);
  });

  server.listen(port, function () {
    console.log('app listening port 8080');
  });

});
