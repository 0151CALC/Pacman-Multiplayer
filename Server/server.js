var express = require('express');
var app = express();
var serv = require('http').Server(app);
var io = require('socket.io')(serv);
var fs = require('fs');

var path = __dirname.split('\\');
var clientPath = "";

for (i = 0; i < path.length - 1; i++) {
    clientPath = clientPath + path[i] + "/";
}

app.get("/", function(req, res) {

    res.sendFile(clientPath + '/Client/index.html');

})

app.use('/Client', express.static(clientPath + '/Client'));

serv.listen(2000);

console.log("server operational.");

io.sockets.on('connection', function(socket) {

    console.log("new connection");

})
