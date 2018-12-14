import React from 'react';
import screens from '../screenTypes';
import * as topics from  '../topics.json';
import StartScreen from './screens/StartScreen';
import LobbyScreen from './screens/LobbyScreen';
import RoomScreen from './screens/RoomScreen';
import AnswerScreen from './screens/AnswerScreen';
import ResultScreen from './screens/ResultScreen';
import EndScreen from './screens/EndScreen';
import Scoreboard from './Scoreboard';
import io from 'socket.io-client';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      screen: screens.START,
      username: '',
      roomName: '',
      isLeader: false,
      rooms: {},
      rounds: [],
      /*
      rooms: {
        'roomname': {
          hasStarted: false,
          password: '',
          leader: 'leaderName',
          topic: 'Star Wars',
          numRounds: 5,
          players: [{
            socketId: 'abc123',
            username: 'username1',
          }],
        },
      },
      rounds: [{
        'username1': {
          term: 'term',
          fullTerm: 'full term',
          points: 10
        },
        'username2': {
          term: 'term',
          fullTerm: 'full term',
          points: 20
        },
      }],
      */
    }

    // this.socket = io.connect('https://simplistic-chatter.glitch.me/');
    this.socket = io.connect('http://localhost:3000');
    this.maxPlayersPerRoom = 5;
    this.fullResults = [];
    this.totalScore = {};
    this.colors = [
      '#2196f3',
      '#f44336',
      '#ffca28',
      '#43a047',
      '#9c27b0',
    ];
    this.topics = topics.default; // TODO: add banned words per keyword? i.e: trump: {'Donald, 'President'}
  }

  componentDidMount = () => {
    this.socket.emit('playerConnected');
    this.socket.on('all.updateRooms', this.updateRooms);
  }

  updateGameState = (state) => {
    this.setState(state);
  }

  updateRooms = (rooms) => {
    this.setState({ rooms });
  };

  updateTotalScore = (lastRound) => {
    Object.keys(lastRound).forEach(player => {
      if (!this.totalScore[player]) {
        this.totalScore[player] = 0;
      }

      this.totalScore[player] += lastRound[player].points;
    });
  }

  setFullResults = (fullResults) => {
    this.fullResults = fullResults;
  }

  screenSelector = (screen) => {
    const defaultProps = {
      state: this.state,
      socket: this.socket,
      updateGameState: this.updateGameState,
    };
    let nextScreen;

    switch (screen) {
      default:
      case screens.START:
        nextScreen =
          <StartScreen
            {...defaultProps}
          />;
        break;

      case screens.LOBBY:
        nextScreen =
          <LobbyScreen
            {...defaultProps}
            maxPlayersPerRoom={this.maxPlayersPerRoom}
          />;
        break;

      case screens.ROOM:
        nextScreen =
          <RoomScreen
            {...defaultProps}
            topics={this.topics}
            maxPlayersPerRoom={this.maxPlayersPerRoom}
          />;
        break;

      case screens.ANSWER:
        nextScreen =
          <AnswerScreen
            {...defaultProps}
            updateTotalScore={this.updateTotalScore}
            topics={this.topics}
            setFullResults={this.setFullResults}
          />
        break;
      
      case screens.RESULT:
        nextScreen =
          <ResultScreen
            {...defaultProps}
            fullResults={this.fullResults}
            colors={this.colors}
          />
        break;

        case screens.END:
        nextScreen =
          <EndScreen
            totalScore={this.totalScore}
          />
        break;
    }

    return nextScreen;
  }

  render() {
    const currentScreen = this.screenSelector(this.state.screen);

    return (
      <div>
        {
          Object.keys(this.totalScore).length > 0 &&
          <Scoreboard
            roomName={this.state.roomName}
            rooms={this.state.rooms}
            totalScore={this.totalScore}
          />
        }
        {currentScreen}
      </div>
    );
  }
}

export default App;
