const utils = require('./Utils');

exports.submitUsername = (rooms, socket, io, players, username) => {
  if (players[username]) {
    socket.emit('player.duplicateUsername');
    return;
  }

  if (!utils.isValidLength(username)) {
    socket.emit('player.invalidUsername');
    return;
  }

  players[username] = socket.id;
  io.emit('all.updateRooms', rooms);
  socket.emit('player.acceptedUsername');
};
