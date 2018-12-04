import React from 'react';
import StartScreen from './StartScreen';
import Username from './Username';
import AnswerScreen from './AnswerScreen';
import ResultScreen from './ResultScreen';
import EndScreen from './EndScreen';
import Scoreboard from './Scoreboard';
import io from 'socket.io-client';

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      screen: '',
      username: '',
      room: '',
      isLeader: false,
      rooms: {},
      rounds: [],
      topic: '',
      totalScore: {},
      // rooms: {
      //   'roomname': {
      //     hasStarted: false,
      //     password: '',
      //     leader: 'leaderName',
      //     players: ['playerName'],
      //   },
      // },
      // rounds: [{
      //   'username1': {
      //     term: 'term',
      //     fullTerm: 'full term',
      //     points: 10
      //   },
      //   'username2': {
      //     term: 'term',
      //     fullTerm: 'full term',
      //     points: 20
      //   },
      // }],
    }

    // this.socket = io.connect('https://simplistic-chatter.glitch.me/');
    this.socket = io.connect('http://localhost:3000');
    this.numRounds = 0,
    this.topics = { // TODO: add banned words per keyword? i.e: trump: {'Donald, 'President'}
      'Politics': [
        'Trump',
        'Russia',
        'President',
      ],
      'Star Wars': [
        'Jedi',
        'Force',
        'Saber',
      ],
      'Sex': [
        'nipples',
        'trans',
        'blowjob',
        'sweaty',
        'loads',
        'shaved',
        'gaping',
        'impregnation',
      ]
    }
  }

  componentDidMount = () => {
    this.socket.emit('playerConnected');
    this.socket.on('all.updateRooms', this.updateRooms);
  }

  updateGameState = (state, callback) => {
    this.setState(state, callback);
  }

  updateRooms = (rooms) => {
    this.setState({ rooms });
  };

  setNumRounds = (numRounds) => {
    this.numRounds = numRounds;
  }

  updateTotalScore = () => {
    this.setState((prevState) => {
      const newTotal = {}

      prevState.rounds.forEach((round) => {
        Object.keys(round).forEach(player => {
          if (!newTotal[player]) {
            newTotal[player] = 0;
          }
          newTotal[player] += round[player].points;
        });
      });

      return { totalScore: newTotal };
    });
  }

  screenSelector = (screen) => {
    let nextScreen;

    switch (screen) {
      default:
        nextScreen =
          <Username
            state={this.state}
            socket={this.socket}
            updateGameState={this.updateGameState}
          />
        break;

      case 'START':
        nextScreen =
          <StartScreen
            state={this.state}
            socket={this.socket}
            updateGameState={this.updateGameState}
            updateRooms={this.updateRooms}
            setNumRounds={this.setNumRounds}
          />;
        break;

      case 'ANSWER':
        nextScreen =
          <AnswerScreen
            state={this.state}
            socket={this.socket}
            updateGameState={this.updateGameState}
            updateRooms={this.updateRooms}
            updateTotalScore={this.updateTotalScore}
            topics={this.topics}
            numRounds={this.numRounds}
          />
        break;
      
      case 'RESULT':
        nextScreen =
          <ResultScreen
            state={this.state}
            socket={this.socket}
            updateGameState={this.updateGameState}
            numRounds={this.numRounds}
          />
        break;

        case 'END':
        nextScreen =
          <EndScreen
            totalScore={this.state.totalScore}
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
          Object.keys(this.state.totalScore).length > 0 &&
          <Scoreboard
            totalScore={this.state.totalScore}
          />
        }
        {currentScreen}
      </div>
    );
  }
}

export default App;
