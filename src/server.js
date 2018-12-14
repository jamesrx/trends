const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const googleTrends = require('google-trends-api');
const Start = require('./server/Start');
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

app.use(express.static(__dirname + '/'));

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

// setInterval(() => {
//   const used = process.memoryUsage();
//   for (let key in used) {
//     console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
//   }
//   console.log('------------');
// }, 3000);

(function() {
  const rooms = {};
  const players = {};
  
  io.on('connection', (socket) => {
    const defaultArgs = [rooms, socket, io];

    socket.on('disconnect', () => {
      if (!Room.disconnect(...defaultArgs, players)) {
        Lobby.disconnect(players, socket.id);
      }
    });

    // Start
    socket.on('submitUsername', (...args) => {
      Start.submitUsername(...defaultArgs, players, ...args);
    });

    // Lobby
    socket.on('createRoom', (...args) => {
      Lobby.createRoom(...defaultArgs, ...args);
    });
    socket.on('joinRoom', (...args) => {
      Lobby.joinRoom(...defaultArgs, ...args);
    });

    // Room
    socket.on('leaveRoom', (...args) => {
      Room.leaveRoom(...defaultArgs, ...args)
    });
    socket.on('startGame', (...args) => {
      Room.startGame(rooms, io, ...args);
    });
    socket.on('updateSettings', (...args) => {
      Room.updateSettings(rooms, socket, ...args);
    });

    // Answer
    socket.on('submitAnswer', (...args) => {
      Answer.submitAnswer(...defaultArgs, ...args);
    });

    // Results
    socket.on('startNextRound', (roomName) => {
      io.to(roomName).emit('room.startNextRound');
    });

  });
})();
