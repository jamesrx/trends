const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const googleTrends = require('google-trends-api');
const Username = require('./server/Username');
const Lobby = require('./server/Lobby');
const Room = require('./server/Room');
const Answer = require('./server/Answer');

server.listen(3000);
console.log('working on 3000');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static(__dirname + '/server'));

app.get('/trends', function (req, res) {
  const terms = req.query.terms.split(',');

  googleTrends.interestOverTime({
    keyword: terms
  }).then(function (data) {
    const results = JSON.parse(data).default.timelineData;
    res.setHeader('Content-Type', 'application/json');
    res.send(results);
  }).catch(function (err) {
    console.error('Error with interestOverTime call', err);
  });
});

const rooms = {};
const players = {};

io.on('connection', (socket) => {

  socket.on('disconnect', () => {
    const roomList = Object.keys(rooms);
    let foundPlayer = false;

    for (let i = 0; i < roomList.length; i++) {
      const roomName = roomList[i];
      const room = rooms[roomName];
      const playerList = room.players;

      for (let j = 0; j < playerList.length; j++) {
        const player = playerList[j];

        if (player.socketId === socket.id) {
          if (room.leader === player.username) {
            // player that disconnected was leader, so delete the room
            delete rooms[roomName];
            io.to(roomName).emit('room.leaderLeft');
          } else {
            // remove player from room
            playerList.splice(j, 1);
          }

          io.emit('all.updateRooms', rooms);

          // remove from players map
          delete players[player.username];
          foundPlayer = true;
          break;
        }
      }

      if (foundPlayer) {
        break;
      }
    }

    if (!foundPlayer) {
      // look up and delete player if they weren't in a room
      const player = Object.keys(players).find((player) => {
        return players[player] === socket.id;
      });

      delete players[player];
    }
  });

  /*****************
   * START SCREEN *
  *****************/

  // Username
  socket.on('submitUsername', (...args) => {
    Username.submitUsername(rooms, socket, io, players, ...args);
  });

  // Lobby
  socket.on('createRoom', (...args) => {
    Lobby.createRoom(rooms, socket, io, ...args);
  });
  socket.on('joinRoom', (...args) => {
    Lobby.joinRoom(rooms, socket, io, ...args);
  });

  // Room
  socket.on('leaveRoom', (...args) => {
    Room.leaveRoom(rooms, socket, io, ...args)
  });
  socket.on('startGame', (...args) => {
    Room.startGame(rooms, io, ...args);
  });

  /******************
   * ANSWER SCREEN *
  ******************/

  socket.on('submitAnswer', (...args) => {
    Answer.submitAnswer(rooms, socket, io, ...args);
  });

  /*******************
   * RESULTS SCREEN *
  *******************/

  socket.on('startNextRound', (roomName) => {
    io.to(roomName).emit('room.startNextRound');
  });

});
