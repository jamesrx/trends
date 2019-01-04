import React from 'react';
import PropTypes from 'prop-types';

const Scoreboard = ({
  rooms,
  roomName,
  totalScore,
}) => (
  <div>
    <h3>Scoreboard:</h3>
    <ul>
      {
        rooms[roomName].players.map(player => (
          <li key={player.socketId}>
            {player.username}
            :
            {totalScore[player.username]}
          </li>
        ))
      }
    </ul>
  </div>
);

Scoreboard.propTypes = {
  rooms: PropTypes.object.isRequired,
  roomName: PropTypes.string.isRequired,
  totalScore: PropTypes.object.isRequired,
};

export default Scoreboard;
