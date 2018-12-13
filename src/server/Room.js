exports.leaveRoom = (rooms, socket, io, roomName, username) => {
  socket.leave(roomName, () => {
    const currentRoom = rooms[roomName];
    const playerIndex = currentRoom.players.findIndex(player => player.username === username);
    const isLeader = (currentRoom.leader === username);

    currentRoom.players.splice(playerIndex, 1); // remove player

    if (isLeader) {
      delete rooms[roomName];
      io.to(roomName).emit('room.leaderLeft');
    }

    io.emit('all.updateRooms', rooms);
  });
};

exports.startGame = (rooms, io, roomName, topic, numRounds) => {
  rooms[roomName].hasStarted = true;
  io.to(roomName).emit('room.startGame', topic, numRounds);
  io.emit('all.updateRooms', rooms);
};

exports.updateSettings = (socket, roomName, topic, numRounds) => {
  socket.to(roomName).emit('room.updateSettings', topic, numRounds);
};