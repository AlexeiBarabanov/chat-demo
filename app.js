var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var port = 8080;

var messages = {};

//app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
  console.log('index requested ', req.url);
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

io.on('connection', function(socket) {
  console.log('user connected via websocket');
  socket.emit('chathistory', messages);

  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  socket.on('message', function (data) {
    timestamp = Date.now();
    messages[timestamp] = {
      username : data.username,
      message : data.message
    };

    console.log('received message from client. broadcasting..');
    io.emit('broadcast', {[timestamp]: messages[timestamp]});
  //console.log(' ', messages);
  });
});

app.use(function (req, res, next) {
  console.error('404: requsted url ' + req.url);
  res.status(400).sendFile(path.join(__dirname, 'public', '404.html'));
})

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500);
})

server.listen(port, function () {
  console.log('app listening port 8080');
})
