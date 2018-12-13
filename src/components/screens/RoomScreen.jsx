import React from 'react';
import screens from '../../screenTypes';

class RoomScreen extends React.Component {
  constructor(props) {
    super(props);

    this.topics = Object.keys(this.props.topics);
    this.state = {
      topic: this.topics[0],
      numRounds: this.props.topics[this.topics[0]].length,
    };
  }

  componentDidMount = () => {
    this.props.socket.on('room.leaderLeft', () => {
      // kick everyone out of the room if the leader leaves
      this.props.updateGameState({
        screen: screens.LOBBY,
        roomName: '',
      });
    });

    this.props.socket.on('room.startGame', (topic, numRounds) => {
      this.props.setNumRounds(numRounds);
      this.props.updateGameState({
        screen: screens.ANSWER,
        topic,
      });
    });

    this.props.socket.on('room.updateSettings', (topic, numRounds) => {
      this.setState({ topic, numRounds });
    });
  }

  leaveRoom = () => {
    this.props.updateGameState({
      screen: screens.LOBBY,
      roomName: '',
      isLeader: false, // will always no longer be leader after leaving a room
    });
    this.props.socket.emit('leaveRoom', this.props.state.roomName, this.props.state.username);
  }

  onNumRoundsChange = (event) => {
    const numRounds = event.target.value;

    this.setState({ numRounds });
    this.props.socket.emit('updateSettings', this.props.state.roomName, this.state.topic, numRounds);
  }

  onTopicChange = (event) => {
    const topic = event.target.value;
    const numRounds = this.props.topics[topic].length;

    this.setState({ topic, numRounds });
    this.props.socket.emit('updateSettings', this.props.state.roomName, topic, numRounds);
  }

  startGame = () => {
    this.props.socket.emit('startGame', this.props.state.roomName, this.state.topic, this.state.numRounds);
  }

  render() {
    const currentRoom = this.props.state.rooms[this.props.state.roomName] || {};
    const playersInRoom = currentRoom.players || [];
    const rounds = [];

    for (let i = this.props.topics[this.state.topic].length; i > 0; i--) {
      rounds.push(<option key={i}>{i}</option>);
    }

    return (
      <div>
        You're in room {this.props.state.roomName}! <button type="button" onClick={this.leaveRoom}>Leave Room</button>
        {
          <div>
            Topic:
            <select disabled={this.props.state.isLeader ? '' : 'disabled'} value={this.state.topic} onChange={this.onTopicChange}>
              {this.topics.map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </select>
            Rounds:
            <select disabled={this.props.state.isLeader ? '' : 'disabled'} value={this.state.numRounds} onChange={this.onNumRoundsChange}>
              {rounds}
            </select>
          </div>
        }
        <h3>Players ({`${playersInRoom.length} / ${this.props.maxPlayersPerRoom}`}):</h3>
        <ul>
          {
            playersInRoom.map((player) => (
              <li key={player.socketId}>{player.username}</li>
            ))
          }
        </ul>
        {
          this.props.state.isLeader
          ? playersInRoom.length > 1 ? <button type="button" onClick={this.startGame}>Start</button> : <div>Waiting for more players</div>
          : <div>Waiting for the room leader to start the game</div>
        }
      </div>
    );
  }
}

export default RoomScreen;
