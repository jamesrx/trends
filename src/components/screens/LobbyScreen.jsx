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
    this.roomNameRef = React.createRef();
    this.minRoomNameLength = 3;
    this.maxRoomNameLength = 20;
  }

  componentDidMount = () => {
    const {
      socket,
      updateGameState,
    } = this.props;

    this.roomNameRef.current.focus();

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

  joinRoom = (event, roomName = '', password = '') => {
    const {
      state,
      updateGameState,
      socket,
    } = this.props;
    const roomNameToJoin = roomName || event.target.value;
    const enteredPassword = password || event.target.dataset.password || '';

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

  joinRoomOnKeyPress = (event) => {
    if (event.which === 13) {
      this.joinRoom(event, event.target.dataset.room, event.target.value);
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

  createRoomOnKeyPress = (event) => {
    if (event.which === 13) {
      this.createRoom();
    }
  }

  onNewRoomPasswordChange = (event) => {
    this.setState({ newRoomPassword: event.target.value });
  }

  onNewRoomNameChange = (event) => {
    const newRoomName = event.target.value;
    const trimmedNewRoomName = newRoomName.trim();
    const invalidRoomName = trimmedNewRoomName.length < this.minRoomNameLength
      || trimmedNewRoomName.length > this.maxRoomNameLength;

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
        <p>You can join an open room, or start your own</p>

        {roomList.length > 0 && roomList.some(room => !state.rooms[room].hasStarted)
          ? (
            <div>
              <h3>Join a room:</h3>
              <ul>
                {
                  roomList.map(room => (
                    !state.rooms[room].hasStarted && (
                      <li key={room}>
                        {room}
                        {
                          state.rooms[room].password && (
                            <input
                              type="password"
                              value={joinRoomPassword[room]}
                              data-room={room}
                              onChange={this.onJoinRoomPasswordChange}
                              onKeyDown={this.joinRoomOnKeyPress}
                            />
                          )
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
          : <h3>No rooms currently open</h3>
        }
        <h3>Start a room:</h3>

        <p>
          Name:
          <input
            type="text"
            className={invalidRoomName || duplicateRoomName ? 'invalid' : null}
            value={newRoomName}
            onChange={this.onNewRoomNameChange}
            onKeyDown={this.createRoomOnKeyPress}
            ref={this.roomNameRef}
          />
        </p>

        <p>
          Password:
          <input
            type="password"
            value={newRoomPassword}
            onChange={this.onNewRoomPasswordChange}
            onKeyDown={this.createRoomOnKeyPress}
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

        {invalidRoomName && (
          <p>
            {`Enter a room name between ${this.minRoomNameLength}-${this.maxRoomNameLength} characters`}
          </p>
        )}

        {duplicateRoomName && <p>That room name is already in use</p>}
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
