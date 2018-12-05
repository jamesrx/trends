const utils = require('./Utils');

exports.submitUsername = (rooms, players, username, socket, io) => {
  if (players[username]) {
    socket.emit('player.duplicateUsername');
    return;
  }

  if (!utils.isValidName(username)) {
    socket.emit('player.invalidUsername');
    return;
  }

  players[username] = socket.id;
  io.emit('all.updateRooms', rooms);
  socket.emit('player.acceptedUsername');
};
