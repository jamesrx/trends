const utils = require('./Utils');

exports.createRoom = (rooms, username, roomName, password, socket, io) => {
  socket.join(roomName, () => {
    if (rooms[roomName]) {
      socket.emit('player.duplicateRoomName');
      return;
    }

    if (!utils.isValidName(roomName)) {
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

exports.joinRoom = (rooms, roomName, username, socket, io) => {
  socket.join(roomName, () => {
    rooms[roomName].players.push({
      socketId: socket.id,
      username
    });

    io.emit('all.updateRooms', rooms);
  });
};
