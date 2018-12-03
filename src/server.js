const express = require('express');
const app = express();
const googleTrends = require('google-trends-api');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

server.listen(3000);
console.log('working on 3000');

app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(express.static(__dirname + '/server'));

const rooms = {};

io.on('connection', (socket) => {

  /*****************
   * START SCREEN *
  *****************/

  io.emit('all.connected', rooms);

  socket.on('createRoom', ({ username, newRoomName, newRoomPassword }) => {
    socket.join(newRoomName, () => {
      rooms[newRoomName] = {
        leader: username,
        password: newRoomPassword,
        players: [username],
        rounds: [],
      };

      io.emit('all.createRoom', rooms);
    });
  });

  socket.on('joinRoom', (roomName, username) => {
    socket.join(roomName, () => {
      rooms[roomName].players.push(username);

      io.to(roomName).emit('room.joinRoom', rooms);
    });
  });

  socket.on('leaveRoom', (roomName, username) => {
    const currentRoom = rooms[roomName];
    const playerIndex = currentRoom.players.indexOf(username);
    const isLeader = (currentRoom.leader === username);

    currentRoom.players.splice(playerIndex, 1); // remove player

    if (isLeader) {
      delete rooms[roomName];
    }

    io.to(roomName).emit('room.leaveRoom', rooms, isLeader);
  });

  socket.on('startGame', (roomName) => {
    io.to(roomName).emit('room.startGame');
  });

  /******************
   * ANSWER SCREEN *
  ******************/

  socket.on('submitAnswer', (term, fullTerm, username, roundNum, numPlayersInRoom, roomName) => {
    const round = rooms[roomName].rounds[roundNum];

    if(!round) {
      // first player to answer this round
      rooms[roomName].rounds[roundNum] = {
        [username]: { term, fullTerm }
      };

      io.to(socket.id).emit('player.acceptedAnswer');

      return;
    }

    // all subsequent answers for the round
    if (checkForDuplicates(term, round)) {
      io.to(socket.id).emit('player.duplicateAnswer');
      return;
    }

    io.to(socket.id).emit('player.acceptedAnswer');
    round[username] = { term, fullTerm };
    const players = Object.keys(round);

    // the last answer for the round
    if (players.length === numPlayersInRoom) {
      // if the term is blank, use a junk term that will score 0 to maintain order of results
      const placeholderTerm = 'akjsdakjsbdajsdabasdjb';
      const terms = players.map((player) => (
        round[player].term === '' ? placeholderTerm : round[player].fullTerm
      ));

      getTrendForTerms(terms, (latestResult) => {
        players.forEach((player) => {
          const indexOfTerm = terms.indexOf(round[player].fullTerm || placeholderTerm);
          const points = latestResult[indexOfTerm];
          round[player].points = points;
        });

        io.to(roomName).emit('room.submitAnswer', rooms[roomName].rounds);
      });
    }
  });

  /*******************
   * RESULTS SCREEN *
  *******************/

  socket.on('startNextRound', (roomName) => {
    io.to(roomName).emit('room.startNextRound');
  });

});

function checkForDuplicates(term, round) {
  let duplicate = false;

  // blank terms can't be duplicates
  if (term !== '') {
    Object.keys(round).forEach((player) => {
      if (term === round[player].term && term !== '') {
        duplicate = true;
      }
    });
  }

  return duplicate;
}

const getTrendForTerms = (terms, callback) => {
  googleTrends.interestOverTime({
    keyword: terms
  }).then(function (data) {
    const results = JSON.parse(data).default.timelineData;
    const latestResult = results.length
      ? results[results.length - 1].value
      : new Array(terms.length).fill(0); // if no terms have any point value an empty array gets returned, so fill it with 0's

    callback(latestResult);
  }).catch(function (err) {
    console.error('Error with interestOverTime call', err);
  });
}






app.get('/trends', function (req, res) {
  const terms = req.query.terms.split(',');

  googleTrends.interestOverTime({
    keyword: terms
  })
    .then(function (data) {
      res.setHeader('Content-Type', 'application/json');
      const results = JSON.parse(data).default.timelineData;
      const latestResult = results.length
        ? results[results.length - 1].value
        : new Array(terms.length).fill(0); // if no terms have any point value an empty array gets returned, so fill it with 0's

      res.send(latestResult);
    })
    .catch(function (err) {
      console.error('Oh no there was an error', err);
    });
})
