import React from 'react';
import PropTypes from 'prop-types';

class EndScreen extends React.Component {
  findWinner = (totalScore) => {
    const winner = Object.keys(totalScore).reduce((acc, player) => {
      if (totalScore[player] >= (totalScore[acc] || 0)) {
        return player;
      }
      return acc;
    });

    return winner;
  }

  render() {
    const { totalScore } = this.props;
    return (
      <>
        <h1>Game Over!</h1>
        <h2>
          Winner:
          {this.findWinner(totalScore)}
        </h2>
      </>
    );
  }
}

EndScreen.propTypes = {
  totalScore: PropTypes.object.isRequired,
};

export default EndScreen;
