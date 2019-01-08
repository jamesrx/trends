exports.deleteRoom = (rooms, roomName) => {
  rooms[roomName] = null;
  delete rooms[roomName];
};