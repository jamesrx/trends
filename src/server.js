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

const checkForDuplicates = (term, round) => {
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

const isValidName = (name, max = 20, min = 3) => {
  name = name.trim();
  const isValid = name.length >= min && name.length <= max;
  return isValid;
}

const rooms = {};
const players = {};

io.on('connection', (socket) => {
  // socket.on('disconnect', (reason) => {
  //   console.log(socket.id, reason);
  // });

  /*****************
   * START SCREEN *
  *****************/

  io.emit('all.updateRooms', rooms);

  socket.on('submitUsername', (username) => {
    if (players[username]) {
      socket.emit('player.duplicateUsername');
      return;
    }
    if (!isValidName(username)) {
      socket.emit('player.invalidUsername');
      return;
    }

    players[username] = username;
    socket.emit('player.acceptedUsername');
  });

  socket.on('createRoom', (username, roomName, password) => {
    socket.join(roomName, () => {
      if (rooms[roomName]) {
        socket.emit('player.duplicateRoomName');
        return;
      }

      if (!isValidName(roomName)) {
        socket.emit('player.invalidRoomName');
        return
      }

      rooms[roomName] = {
        hasStarted: false,
        leader: username,
        password,
        players: [username],
        rounds: [],
      };

      io.emit('all.updateRooms', rooms);
      socket.emit('player.acceptedRoomName');
    });
  });

  socket.on('joinRoom', (roomName, username) => {
    socket.join(roomName, () => {
      rooms[roomName].players.push(username);

      io.to(roomName).emit('room.joinRoom', rooms);
    });
  });

  socket.on('leaveRoom', (roomName, username) => {
    socket.leave(roomName, () => {
      const currentRoom = rooms[roomName];
      const playerIndex = currentRoom.players.indexOf(username);
      const isLeader = (currentRoom.leader === username);
  
      currentRoom.players.splice(playerIndex, 1); // remove player

      if (isLeader) {
        delete rooms[roomName];
      }

      io.to(roomName).emit('room.leaveRoom', isLeader);
      io.emit('all.updateRooms', rooms);
    });
  });

  socket.on('startGame', (roomName) => {
    rooms[roomName].hasStarted = true;
    io.to(roomName).emit('room.startGame');
    io.emit('all.updateRooms', rooms);
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

      socket.emit('player.acceptedAnswer');

      return;
    }

    // all subsequent answers for the round
    if (checkForDuplicates(term, round)) {
      socket.emit('player.duplicateAnswer');
      return;
    }

    socket.emit('player.acceptedAnswer');
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

  getTrendForTerms(terms, (latestResult) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(latestResult);
  });
})
