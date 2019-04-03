import React from 'react';
import PropTypes from 'prop-types';

const Scoreboard = ({
  rooms,
  roomName,
  totalScore,
}) => (
  <div>
    <h3>Leaderboard:</h3>
    <ol>
      {
        rooms[roomName].players
          .sort((playerA, playerB) => totalScore[playerB.username] - totalScore[playerA.username])
          .map(player => (
            <li key={player.socketId}>
              {player.username}
              {': '}
              {totalScore[player.username]}
            </li>
          ))
      }
    </ol>
  </div>
);

Scoreboard.propTypes = {
  rooms: PropTypes.object.isRequired,
  roomName: PropTypes.string.isRequired,
  totalScore: PropTypes.object.isRequired,
};

export default Scoreboard;
