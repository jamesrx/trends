import React from 'react';
import PropTypes from 'prop-types';
import screens from '../../screenTypes';

class EndScreen extends React.Component {
  componentDidMount = () => {
    const {
      socket,
      state,
    } = this.props;

    socket.emit('endGame', state.roomName);
    state.rooms[state.roomName] = null;
    delete state.rooms[state.roomName];
  }

  findWinners = (totalScore) => {
    let winners = [];
    let highScore = 0;

    Object.keys(totalScore).forEach((player) => {
      if (totalScore[player] > highScore) {
        winners = [player];
        highScore = totalScore[player];
      } else if (totalScore[player] === highScore) {
        winners.push(player);
      }
    });

    return winners;
  }

  playAgain = () => {
    const {
      clearTotalScore,
      updateGameState,
    } = this.props;

    clearTotalScore();
    updateGameState({
      screen: screens.LOBBY,
      roomName: '',
      isLeader: false,
      rounds: [],
    });
  }

  render() {
    const renderWinner = () => {
      const { totalScore } = this.props;
      const winners = this.findWinners(totalScore);
      let title = 'It\'s a tie between';
      let formattedWinners;
      let lastWinner;

      switch (winners.length) {
        case 1:
          title = 'Winner';
          [formattedWinners] = winners;
          break;
        case 2:
          formattedWinners = winners.join(' and ');
          break;
        default:
          lastWinner = winners.pop();
          formattedWinners = `${winners.join(', ')}, and ${lastWinner}`;
          break;
      }

      return (
        <>
          {`${title}: ${formattedWinners}`}
        </>
      );
    };

    return (
      <>
        <h1>Game Over!</h1>
        <h2>{renderWinner()}</h2>
        <button
          type="button"
          onClick={this.playAgain}
        >
          Play Again
        </button>
      </>
    );
  }
}

EndScreen.propTypes = {
  socket: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  clearTotalScore: PropTypes.func.isRequired,
  updateGameState: PropTypes.func.isRequired,
  totalScore: PropTypes.object.isRequired,
};

export default EndScreen;
