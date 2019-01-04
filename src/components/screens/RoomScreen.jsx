import React from 'react';
import PropTypes from 'prop-types';
import screens from '../../screenTypes';

class RoomScreen extends React.Component {
  constructor(props) {
    super(props);
    const {
      topics,
      state,
    } = this.props;

    this.topicWasSet = false;
    this.topics = Object.keys(topics);
    this.state = {
      topic: state.rooms[state.roomName].topic || this.topics[0],
      numRounds: state.rooms[state.roomName].numRounds || topics[this.topics[0]].length,
    };
  }

  componentDidMount = () => {
    const {
      socket,
      updateGameState,
    } = this.props;

    socket.on('room.leaderLeft', () => {
      // kick everyone out of the room if the leader leaves
      updateGameState({
        screen: screens.LOBBY,
        roomName: '',
      });
    });

    socket.on('room.startGame', () => {
      updateGameState({ screen: screens.ANSWER });
    });

    socket.on('room.updateSettings', (topic, numRounds) => {
      this.setState({ topic, numRounds });
    });
  }

  componentWillUnmount = () => {
    const { socket } = this.props;

    socket.off('room.leaderLeft');
    socket.off('room.startGame');
    socket.off('room.updateSettings');
  }

  leaveRoom = () => {
    const {
      updateGameState,
      socket,
      state,
    } = this.props;

    updateGameState({
      screen: screens.LOBBY,
      roomName: '',
      isLeader: false, // will always no longer be leader after leaving a room
    });
    socket.emit('leaveRoom', state.roomName, state.username);
  }

  onNumRoundsChange = (event) => {
    const numRounds = event.target.value;
    const {
      socket,
      state,
    } = this.props;
    const { topic } = this.state;

    this.topicWasSet = true;
    this.setState({ numRounds });
    socket.emit('updateSettings', state.roomName, topic, numRounds);
  }

  onTopicChange = (event) => {
    const {
      topics,
      socket,
      state,
    } = this.props;
    const topic = event.target.value;
    const numRounds = topics[topic].length;

    this.topicWasSet = true;
    this.setState({ topic, numRounds });
    socket.emit('updateSettings', state.roomName, topic, numRounds);
  }

  startGame = () => {
    const {
      socket,
      state,
    } = this.props;

    const {
      topic,
      numRounds,
    } = this.state;

    if (!this.topicWasSet) {
      socket.emit('updateSettings', state.roomName, topic, numRounds);
    }

    socket.emit('startGame', state.roomName);
  }

  render() {
    const {
      state,
      topics,
      maxPlayersPerRoom,
    } = this.props;

    const {
      topic,
      numRounds,
    } = this.state;

    const currentRoom = state.rooms[state.roomName] || {};
    const playersInRoom = currentRoom.players || [];
    const rounds = [];

    for (let i = topics[topic].length; i > 0; i -= 1) {
      rounds.push(<option key={i}>{i}</option>);
    }

    const renderStartGame = () => {
      if (state.isLeader) {
        if (playersInRoom.length > 1) {
          return (
            <button
              type="button"
              onClick={this.startGame}
            >
              Start
            </button>
          );
        }
        return (<div>Waiting for more players</div>);
      }
      return (<div>Waiting for the room leader to start the game</div>);
    };

    return (
      <>
        <p>
          You&apos;re in room
          {state.roomName}
          !
          <button
            type="button"
            onClick={this.leaveRoom}
          >
            Leave Room
          </button>
        </p>
        {
          <div>
            Topic:
            <select
              disabled={state.isLeader ? '' : 'disabled'}
              value={topic}
              onChange={this.onTopicChange}
            >
              {this.topics.map(topicEl => (
                <option key={topicEl}>{topicEl}</option>
              ))}
            </select>

            Rounds:
            <select
              disabled={state.isLeader ? '' : 'disabled'}
              value={numRounds}
              onChange={this.onNumRoundsChange}
            >
              {rounds}
            </select>
          </div>
        }

        <h3>
          Players (
          {`${playersInRoom.length} / ${maxPlayersPerRoom}`}
          ):
        </h3>

        <ul>
          {
            playersInRoom.map(player => (
              <li key={player.socketId}>{player.username}</li>
            ))
          }
        </ul>

        {renderStartGame()}
      </>
    );
  }
}

RoomScreen.propTypes = {
  topics: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired,
  updateGameState: PropTypes.func.isRequired,
  maxPlayersPerRoom: PropTypes.number.isRequired,
};

export default RoomScreen;
