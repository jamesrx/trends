import React from 'react';
import screens from '../../screenTypes';
import BarChart from '../BarChart'
import LineChart from '../LineChart'

class ResultScreen extends React.Component {
  constructor(props) {
    super(props);

    this.currentRound = this.props.state.rounds.length;
  }

  componentDidMount = () => {
    this.props.socket.on('room.startNextRound', () => {
      const nextScreen = this.currentRound < this.props.state.rooms[this.props.state.roomName].numRounds ? screens.ANSWER : screens.END;
      this.props.updateGameState({ screen: nextScreen });
    });
  }

  componentWillUnmount = () => {
    this.props.socket.off('room.startNextRound');
  }

  startNextRound = () => {
    this.props.socket.emit('startNextRound', this.props.state.roomName);
  }

  render() {
    const lastRound = this.props.state.rounds[this.currentRound - 1] || {};

    return (
      <div id="resultscreen">
        <h3>Results from round {this.currentRound}:</h3>
        <ul>
          {
            Object.keys(lastRound).map(player => (
              <li key={player}>
                {player}:
                {lastRound[player].fullTerm ? `guessed ${lastRound[player].fullTerm}` : 'didn\'t answer in time'}
                ({lastRound[player].points} points)
              </li>
            ))
          }
        </ul>

        <BarChart
          lastRound={lastRound}
          colors={this.props.colors}
        />

        <LineChart
          fullResults={this.props.fullResults}
          lastRound={lastRound}
          colors={this.props.colors}
        />

        <h3>Rounds left: {(this.props.state.rooms[this.props.state.roomName].numRounds - this.currentRound)}</h3>
        {this.props.state.isLeader && <button type="button" onClick={this.startNextRound}>Next</button>}
      </div>
    );
  }
}

export default ResultScreen;
