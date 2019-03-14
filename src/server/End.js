exports.deleteRoom = (rooms, roomName) => {
  delete rooms[roomName];
};