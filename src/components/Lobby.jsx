import React from 'react';

class Lobby extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      newRoomName: '',
      newRoomPassword: '',
      joinRoomPassword: {}
    };
  }

  componentDidMount = () => {
    this.props.socket.on('all.connected', this.props.updateRooms);
    this.props.socket.on('all.createRoom', this.props.updateRooms);
    this.props.socket.on('room.joinRoom', this.props.updateRooms);
  }

  joinLobby = () => {
    this.props.updateGameState({username: this.state.username});
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
    this.props.updateGameState({
      room: this.state.newRoomName,
      isLeader: true,
    });

    this.props.socket.emit('createRoom', this.state);
  }

  onTextFieldChange = (event) => {
    this.setState({[event.target.dataset.key]: event.target.value})
  }

  onRoomPasswordChange = (event) => {
    this.setState({
      joinRoomPassword: {
        [event.target.dataset.room]: event.target.value
      }
    });
  }

  render() {
    const nameField = (
      <div>
        Enter your name: <input type="text" value={this.state.username} data-key="username" onChange={this.onTextFieldChange} />
        <button type="button" onClick={this.joinLobby}>Connect</button>
      </div>
    );

    const lobby = (
      <div>
        <div>Welcome to the game lobby <b>{this.props.state.username}</b>!</div>
        <h3>Join a room:</h3>
        <ul>
          {
            Object.keys(this.props.state.rooms).map((room) => (
              <li key={room}>
                {room}
                {this.props.state.rooms[room].password ? <input type="password" value={this.state.joinRoomPassword[room]} data-room={room} onChange={this.onRoomPasswordChange} /> : ''}
                <button type="button" value={room} data-password={this.state.joinRoomPassword[room]} onClick={this.joinRoom}>Join</button>
              </li>
            ))
          }
        </ul>
        <div>
          <h3>Or start one:</h3>
          Name: <input type="text" value={this.state.newRoomName} data-key="newRoomName" onChange={this.onTextFieldChange} /><br />
          Password: <input type="password" value={this.state.newRoomPassword} data-key="newRoomPassword" onChange={this.onTextFieldChange} /> (Optional)<br />
          <button type="button" onClick={this.createRoom}>Create</button>
        </div>
      </div>
    );

    return this.props.state.username ? lobby : nameField;
  }
}

export default Lobby;
