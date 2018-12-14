exports.leaveRoom = (rooms, socket, io, roomName, username) => {
  socket.leave(roomName, () => {
    const currentRoom = rooms[roomName];
    const playerIndex = currentRoom.players.findIndex(player => player.username === username);
    const isLeader = (currentRoom.leader === username);

    currentRoom.players.splice(playerIndex, 1); // remove player

    if (isLeader) {
      rooms[roomName] = null;
      delete rooms[roomName];
      io.to(roomName).emit('room.leaderLeft');
    }

    io.emit('all.updateRooms', rooms);
  });
};

exports.startGame = (rooms, io, roomName) => {
  rooms[roomName].hasStarted = true;
  io.to(roomName).emit('room.startGame');
  io.emit('all.updateRooms', rooms);
};

exports.updateSettings = (rooms, socket, roomName, topic, numRounds) => {
  rooms[roomName].topic = topic;
  rooms[roomName].numRounds = numRounds;
  socket.to(roomName).emit('room.updateSettings', topic, numRounds);
};

exports.disconnect = (rooms, socket, io, players) => {
  const roomList = Object.keys(rooms);

  for (let i = 0; i < roomList.length; i++) {
    const roomName = roomList[i];
    const room = rooms[roomName];
    const playerList = room.players;

    for (let j = 0; j < playerList.length; j++) {
      const player = playerList[j];

      if (player.socketId === socket.id) {
        if (room.leader === player.username) {
          // player that disconnected was leader, so delete the room
          rooms[roomName] = null;
          delete rooms[roomName];
          io.to(roomName).emit('room.leaderLeft');
        } else {
          // remove player from room
          playerList.splice(j, 1);
        }

        io.emit('all.updateRooms', rooms);

        // remove from players map
        players[player.username] = null;
        return delete players[player.username];
      }
    }
  }
}
