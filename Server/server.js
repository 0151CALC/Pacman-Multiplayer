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
printWithTime("Server Operational");
setInterval(status, 1000); // run status function every second.

var clients = new Map();
var gameRooms = [];

io.sockets.on('connection', function(socket) {

    var client = {
        name: null,
        inGameRoom: null,
    }

    socket.on('joinGame', function(name, host, roomCode) {

        if (host) {

            console.log("wants to host");

        }

    })

    clients.set(socket.id, client)

    socket.on('disconnect', function() {

        clients.delete(socket.id);


    })

})

function status() {

    if (clients.size > 0) {
        printWithTime("There are " + clients.size +  " client(s) connected");
    } else {
        printWithTime("There are no clients connected");
    }

}

function printWithTime(msg) {

    var date = new Date();

    var hour = date.getHours();
    var minute = date.getMinutes();
    var second = date.getSeconds();
    //console.log('\033[2J');

    console.log(hour + ":" + minute + ":" + second + " - " + msg);
}
