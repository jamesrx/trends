import React from 'react';
import PropTypes from 'prop-types';
import screens from '../../screenTypes';
import BarChart from '../BarChart';
import LineChart from '../LineChart';

class ResultScreen extends React.Component {
  constructor(props) {
    super(props);
    const { state } = this.props;

    this.currentRound = state.rounds.length;
  }

  componentDidMount = () => {
    const {
      socket,
      state,
      updateGameState,
    } = this.props;

    socket.on('room.startNextRound', () => {
      const nextScreen = this.currentRound < state.rooms[state.roomName].numRounds
        ? screens.ANSWER
        : screens.END;
      updateGameState({ screen: nextScreen });
    });
  }

  componentWillUnmount = () => {
    const { socket } = this.props;

    socket.off('room.startNextRound');
  }

  startNextRound = () => {
    const {
      socket,
      state,
    } = this.props;

    socket.emit('startNextRound', state.roomName);
  }

  render() {
    const {
      state,
      colors,
      fullResults,
    } = this.props;
    const lastRound = state.rounds[this.currentRound - 1] || {};

    return (
      <>
        <h3>
          Results from round
          {this.currentRound}
          :
        </h3>
        <ul>
          {
            Object.keys(lastRound).map(player => (
              <li key={player}>
                {player}
                :
                {lastRound[player].fullTerm
                  ? `guessed ${lastRound[player].fullTerm}`
                  : 'didn\'t answer in time'}
                (
                {lastRound[player].points}
                points
                )
              </li>
            ))
          }
        </ul>

        <BarChart
          lastRound={lastRound}
          colors={colors}
        />

        <LineChart
          fullResults={fullResults}
          lastRound={lastRound}
          colors={colors}
        />

        <h3>
          Rounds left:
          {(state.rooms[state.roomName].numRounds - this.currentRound)}
        </h3>
        {
          state.isLeader && (
            <button
              type="button"
              onClick={this.startNextRound}
            >
              Next
            </button>
          )
        }
      </>
    );
  }
}

ResultScreen.propTypes = {
  state: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired,
  updateGameState: PropTypes.func.isRequired,
  colors: PropTypes.arrayOf(PropTypes.string).isRequired,
  fullResults: PropTypes.array.isRequired,
};

export default ResultScreen;
