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
setInterval(status, 10000);

var clients = [];
var gameRooms = [];

io.sockets.on('connection', function(socket) {

    var client = {
        name: null,
        inGameRoom: null,
        socketID: socket.id,
    }

    socket.on('joinGame', function(name, host, roomCode) {

        if (host) {

            console.log("wants to host");

        }

    })

})

function status() {
    printWithTime("Server Operational");
}

function printWithTime(msg) {

    var date = new Date();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    console.log('\033[2J');

    console.log(hour + ":" + minute + ":" + second + " - " + msg);
}
