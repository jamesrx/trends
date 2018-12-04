import React from 'react';

class Lobby extends React.Component {
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
    this.props.socket.on('room.joinRoom', this.props.updateRooms);

    this.props.socket.on('player.duplicateRoomName', () => {
      this.setState({ duplicateRoomName: true });
    });

    this.props.socket.on('player.invalidRoomName', () => {
      this.setState({ invalidRoomName: true });
    });

    this.props.socket.on('player.acceptedRoomName', () => {
      this.props.updateGameState({
        room: this.state.newRoomName,
        isLeader: true,
      });
    });
  }

  joinLobby = () => {
    console.log('join');
    this.setState({ submittedUsername: true });
    this.props.socket.emit('joinLobby', this.state.newUsername);
  }

  joinRoom = (event) => {
    const roomNameToJoin = event.target.value;
    const enteredPassword = event.target.dataset.password || '';

    if (this.props.state.rooms[roomNameToJoin].password === enteredPassword) {
      this.props.updateGameState({room: roomNameToJoin});
      this.props.socket.emit('joinRoom', roomNameToJoin, this.props.state.username);
    } else {
      alert ('Wrong password!');
    }
  }

  createRoom = () => {
    this.props.socket.emit(
      'createRoom',
      this.props.state.username,
      this.state.newRoomName,
      this.state.newRoomPassword
    );
  }

  onTextFieldChange = (event) => {
    this.setState({[event.target.dataset.key]: event.target.value})
  }

  onNewRoomNameChange = (event) => {
    const newRoomName = event.target.value;
    const trimmedNewRoomName = newRoomName.trim();
    let invalidRoomName = trimmedNewRoomName.length < 3 || trimmedNewRoomName.length > 20;

    this.setState({
      newRoomName,
      invalidRoomName,
      duplicateRoomName: false
    });
  }

  onRoomPasswordChange = (event) => {
    this.setState({
      joinRoomPassword: {
        [event.target.dataset.room]: event.target.value
      }
    });
  }

  render() {
    const roomList = Object.keys(this.props.state.rooms);

    return (
      <div>
        <div>Welcome to the game lobby <b>{this.props.state.username}</b>!</div>
        {roomList.length > 0 && roomList.some(room => !this.props.state.rooms[room].hasStarted)
          ? <div>
            <h3>Join a game:</h3>
            <ul>
              {
                roomList.map((room) => (
                  !this.props.state.rooms[room].hasStarted &&
                  <li key={room}>
                    {room}
                    {this.props.state.rooms[room].password ? <input type="password" value={this.state.joinRoomPassword[room]} data-room={room} onChange={this.onRoomPasswordChange} /> : ''}
                    <button type="button" value={room} data-password={this.state.joinRoomPassword[room]} onClick={this.joinRoom}>Join</button>
                  </li>
                ))
              }
            </ul>
          </div>
          : <h3>No games currently open</h3>
        }
        <div>
          <h3>Start a room:</h3>
          Name: <input type="text" value={this.state.newRoomName} onChange={this.onNewRoomNameChange} /><br />
          Password: <input type="password" value={this.state.newRoomPassword} data-key="newRoomPassword" onChange={this.onTextFieldChange} /> (Optional)<br />
          <button disabled={this.state.invalidRoomName || this.state.duplicateRoomName ? 'disabled' : ''} type="button" onClick={this.createRoom}>Create</button>
          {this.state.invalidRoomName && <div>Enter a room name between 3-20 characters</div>}
          {this.state.duplicateRoomName && <div>That room name's already in use</div>}
        </div>
      </div>
    );
  }
}

export default Lobby;
