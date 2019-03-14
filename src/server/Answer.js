const googleTrends = require('google-trends-api');
const utils = require('./Utils');

const getPointsForTerms = (terms, callback) => {
  googleTrends.interestOverTime({
    keyword: terms
  }).then(function (data) {
    const fullResults = JSON.parse(data).default.timelineData;
    const latestResult = fullResults.length
      ? fullResults[fullResults.length - 1].value
      : new Array(terms.length).fill(0); // if no terms have any point value an empty array gets returned, so fill it with 0's

    callback(latestResult, fullResults);
  }).catch(function (err) {
    console.error('Error with interestOverTime call', err);
  });
}

const isTermDuplicate = (term, round) => {
  let duplicate = false;

  // allow blank terms to be duplicates
  if (term !== '') {
    Object.keys(round).forEach((player) => {
      if (term.toLowerCase() === round[player].term.toLowerCase() && term !== '') {
        duplicate = true;
      }
    });
  }

  return duplicate;
}

exports.submitAnswer = (rooms, socket, io, term, fullTerm, username, roundNum, roomName) => {
  const round = rooms[roomName].rounds[roundNum];

  if (term !== '' && !utils.isValidLength(term)) {
    socket.emit('player.invalidAnswer');
    return;
  }

  if(!round) {
    // first player to answer this round
    rooms[roomName].rounds[roundNum] = {
      [username]: { term, fullTerm }
    };

    socket.emit('player.acceptedAnswer');
    return;
  }

  // all subsequent answers for the round
  if (isTermDuplicate(term, round)) {
    socket.emit('player.duplicateAnswer');
    return;
  }

  socket.emit('player.acceptedAnswer');
  round[username] = { term, fullTerm };
  const players = Object.keys(round);

  // the last answer for the round (all players have answered)
  if (players.length === rooms[roomName].players.length) {
    // if the term is blank, use a term that will score 0 to maintain order of results (plus random str so the searches from the game never get a score)
    const placeholderTerm = 'gajdwck2ox' + Math.random().toString(36).substring(2);
    const terms = players.map((player) => (
      round[player].term === '' ? placeholderTerm : round[player].fullTerm
    ));

    getPointsForTerms(terms, (latestResult, fullResults) => {
      players.forEach((player) => {
        const indexOfTerm = terms.indexOf(round[player].fullTerm || placeholderTerm);
        const points = latestResult[indexOfTerm];
        round[player].points = points;
      });

      io.to(roomName).emit('room.submitAnswer', rooms[roomName].rounds, fullResults);
    });
  }
};
