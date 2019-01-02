const utils = require('./Utils');

exports.createRoom = (rooms, socket, io, username, roomName, password) => {
  socket.join(roomName, () => {
    if (rooms[roomName]) {
      socket.emit('player.duplicateRoomName');
      return;
    }

    if (!utils.isValidLength(roomName)) {
      socket.emit('player.invalidRoomName');
      return
    }

    rooms[roomName] = {
      hasStarted: false,
      leader: username,
      password,
      players: [{
        socketId: socket.id,
        username
      }],
      rounds: [],
    };

    io.emit('all.updateRooms', rooms);
    socket.emit('player.acceptedRoomName');
  });
};

exports.joinRoom = (rooms, socket, io, roomName, username) => {
  socket.join(roomName, () => {
    rooms[roomName].players.push({
      socketId: socket.id,
      username
    });

    io.emit('all.updateRooms', rooms);
  });
};

exports.disconnect = (players, socketId) => {
    // look up and delete player if they weren't in a room
    const player = Object.keys(players).find((player) => {
      return players[player] === socketId;
    });

    players[player] = null;
    return delete players[player];
}
