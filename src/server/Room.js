exports.leaveRoom = (rooms, roomName, username, socket, io) => {
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

exports.startGame = (rooms, roomName, io) => {
  rooms[roomName].hasStarted = true;
  io.to(roomName).emit('room.startGame');
  io.emit('all.updateRooms', rooms);
};
