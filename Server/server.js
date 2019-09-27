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
var games = new Map();

io.sockets.on('connection', function(socket) {

    var client = {
        name: null,
        inGameRoom: null,
    }

    function updatePlayersInGame(gameCode) {

        socketsInGame = games.get(gameCode).playersInGame;
        playersInGame = [];

        for (i = 0; i < socketsInGame.length; i++) {
            playersInGame.push(clients.get(socketsInGame[i]).name)
        }

        io.sockets.in(gameCode).emit('updatePlayersInGame', {
            playersInGame: playersInGame
        });
    }

    socket.on('joinGame', function(data) {

        var success = false
        var gameCode = data.gameCode;

        if (data.name != "" && data.name != null) {
            client.name = data.name
        }
        if (clients.get(socket.id).inGameRoom == null) {
            if (data.wantsToHost) {

                var allowedChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"; // The set of characters that will be used to create the random 4 char code for the room.
                var generatedCode = ""; // Initializing a string var for the generated code.

                for (i = 0; i < 4; i++) { // Simple for loop which will be executed 4 times.
                    var ranNum = Math.floor(Math.random() * allowedChars.length); // Select a random char from the code set.
                    generatedCode += allowedChars.charAt(ranNum); // Add the selected code to the end of the genrerated code string.
                }

                var game = {
                    gameCode: generatedCode,
                    playersInGame: [
                        socket.id
                    ]
                }

                clients.get(socket.id).inGameRoom = generatedCode;

                games.set(generatedCode, game)

                gameCode = generatedCode;
                success = true;
            } else if (!data.wantsToHost) {
                if (gameCode != "" && gameCode != null) {
                    if (games.has(gameCode)) {
                        games.get(gameCode).playersInGame.push(socket.id)
                        clients.get(socket.id).inGameRoom = gameCode;
                        success = true;
                    } else {
                        socket.emit('displayErrorMsg', {
                            msg: "Game Code Invalid"
                        });
                    }
                }
            }
        } else {
            console.log("User '" + clients.get(socket.id).name + "' tried to join another game before leaving the one they are in.");
        }

        if (success) {

            socket.join(gameCode);
            socket.emit('gameSetup', {
                gameCode: gameCode
            });
            updatePlayersInGame(gameCode);
        }

    })

    clients.set(socket.id, client)

    socket.on('disconnect', function() {

        gamecode = clients.get(socket.id).inGameRoom;
        if (gamecode != null) {
            if (games.get(gamecode).playersInGame.length == 1) {
                games.delete(gamecode); // If by this player leaving the room becomes empty delete the room.
                console.log("Room " + gamecode + " has been deleted due to lack of connected players.");
            } else if (games.get(gamecode).playersInGame.length > 1) {
                index = games.get(gamecode).playersInGame.indexOf(socket.id);
                games.get(gamecode).playersInGame.splice(index, 1); // else just remove the players socket.id from the array playersInGame.
                updatePlayersInGame(gamecode);
            }
        }

        console.log(clients.get(socket.id).name + " has disconnected.");
        clients.delete(socket.id); // delete the client from the clients array.
    })

})

function status() {
    console.log(clients)
    console.log(games);

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
