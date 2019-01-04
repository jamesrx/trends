import React from 'react';
import PropTypes from 'prop-types';
import screens from '../../screenTypes';

class LobbyScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      newRoomName: '',
      newRoomPassword: '',
      joinRoomPassword: {},
      duplicateRoomName: false,
      invalidRoomName: true,
    };
  }

  componentDidMount = () => {
    const {
      socket,
      updateGameState,
    } = this.props;

    socket.on('player.duplicateRoomName', () => {
      this.setState({ duplicateRoomName: true });
    });

    socket.on('player.invalidRoomName', () => {
      this.setState({ invalidRoomName: true });
    });

    socket.on('player.acceptedRoomName', () => {
      const { newRoomName } = this.state;

      updateGameState({
        screen: screens.ROOM,
        roomName: newRoomName,
        isLeader: true,
      });
    });
  }

  componentWillUnmount = () => {
    const { socket } = this.props;

    socket.off('player.duplicateRoomName');
    socket.off('player.invalidRoomName');
    socket.off('player.acceptedRoomName');
  }

  joinRoom = (event) => {
    const {
      state,
      updateGameState,
      socket,
    } = this.props;
    const roomNameToJoin = event.target.value;
    const enteredPassword = event.target.dataset.password || '';

    if (state.rooms[roomNameToJoin].password === enteredPassword) {
      updateGameState({
        screen: screens.ROOM,
        roomName: roomNameToJoin,
      });
      socket.emit('joinRoom', roomNameToJoin, state.username);
    } else {
      alert('Wrong password!');
    }
  }

  createRoom = () => {
    const {
      socket,
      state,
    } = this.props;

    const {
      newRoomName,
      newRoomPassword,
    } = this.state;

    socket.emit(
      'createRoom',
      state.username,
      newRoomName,
      newRoomPassword,
    );
  }

  onNewRoomPasswordChange = (event) => {
    this.setState({ newRoomPassword: event.target.value });
  }

  onNewRoomNameChange = (event) => {
    const newRoomName = event.target.value;
    const trimmedNewRoomName = newRoomName.trim();
    const invalidRoomName = trimmedNewRoomName.length < 3 || trimmedNewRoomName.length > 20;

    this.setState({
      newRoomName,
      invalidRoomName,
      duplicateRoomName: false,
    });
  }

  onJoinRoomPasswordChange = (event) => {
    this.setState({
      joinRoomPassword: {
        [event.target.dataset.room]: event.target.value,
      },
    });
  }

  render() {
    const {
      state,
      maxPlayersPerRoom,
    } = this.props;

    const {
      joinRoomPassword,
      newRoomName,
      newRoomPassword,
      invalidRoomName,
      duplicateRoomName,
    } = this.state;

    const roomList = Object.keys(state.rooms);

    return (
      <>
        <p>
          Welcome to the game lobby
          <b>{state.username}</b>
          !
        </p>

        {roomList.length > 0 && roomList.some(room => !state.rooms[room].hasStarted)
          ? (
            <div>
              <h3>Join a game:</h3>
              <ul>
                {
                  roomList.map(room => (
                    !state.rooms[room].hasStarted && (
                      <li key={room}>
                        {room}
                        {
                          state.rooms[room].password
                            ? (
                              <input
                                type="password"
                                value={joinRoomPassword[room]}
                                data-room={room}
                                onChange={this.onJoinRoomPasswordChange}
                              />
                            )
                            : ''
                        }
                        {
                          (state.rooms[room].players.length < maxPlayersPerRoom) && (
                            <button
                              type="button"
                              value={room}
                              data-password={joinRoomPassword[room]}
                              onClick={this.joinRoom}
                            >
                              Join
                            </button>
                          )
                        }
                      </li>
                    )
                  ))
                }
              </ul>
            </div>
          )
          : <h3>No games currently open</h3>
        }
        <div>
          <h3>Start a room:</h3>

          <p>
            Name:
            <input
              type="text"
              value={newRoomName}
              onChange={this.onNewRoomNameChange}
            />
          </p>

          <p>
            Password:
            <input
              type="password"
              value={newRoomPassword}
              onChange={this.onNewRoomPasswordChange}
            />
            (Optional)
          </p>

          <button
            disabled={invalidRoomName || duplicateRoomName ? 'disabled' : ''}
            type="button"
            onClick={this.createRoom}
          >
            Create
          </button>

          {invalidRoomName && <div>Enter a room name between 3-20 characters</div>}
          {duplicateRoomName && <div>That room name is already in use</div>}
        </div>
      </>
    );
  }
}

LobbyScreen.propTypes = {
  socket: PropTypes.object.isRequired,
  updateGameState: PropTypes.func.isRequired,
  state: PropTypes.object.isRequired,
  maxPlayersPerRoom: PropTypes.number.isRequired,
};

export default LobbyScreen;
