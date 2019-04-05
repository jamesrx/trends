import React from 'react';
import PropTypes from 'prop-types';

const Result = ({
  playerName,
  fullTerm,
  points,
}) => (
  <span>
    <b>{`${playerName}: `}</b>
    {
      fullTerm
        ? <>answered <b>{fullTerm}</b></>
        : 'didn\'t answer in time'
    }
    {` (${points} points)`}
  </span>
);

Result.propTypes = {
  playerName: PropTypes.string.isRequired,
  fullTerm: PropTypes.string.isRequired,
  points: PropTypes.number.isRequired,
};

export default Result;
