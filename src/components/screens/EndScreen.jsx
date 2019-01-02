import React from 'react';

class EndScreen extends React.Component {
  constructor(props) {
    super(props);
  }

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
    return (
      <>
        <h1>Game Over!</h1>
        <h2>Winner: {this.findWinner(this.props.totalScore)}</h2>
      </>
    );
  }
}

export default EndScreen;
