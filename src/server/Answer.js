const googleTrends = require('google-trends-api');

const getPointsForTerms = (terms, callback) => {
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

exports.submitAnswer = (rooms, term, fullTerm, username, roundNum, numPlayersInRoom, roomName, socket, io) => {
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
  if (checkDuplicateAnswers(term, round)) {
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

    getPointsForTerms(terms, (latestResult) => {
      players.forEach((player) => {
        const indexOfTerm = terms.indexOf(round[player].fullTerm || placeholderTerm);
        const points = latestResult[indexOfTerm];
        round[player].points = points;
      });

      io.to(roomName).emit('room.submitAnswer', rooms[roomName].rounds);
    });
  }
};
