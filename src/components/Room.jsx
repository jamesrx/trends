import React from 'react';

class Room extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
    this.props.socket.on('room.leaveRoom', (leaderLeft) => {
      if (leaderLeft) {
        // kick everyone out of the room if the leader leaves
        this.props.updateGameState({room: ''});
      }
    });

    this.props.socket.on('room.startGame', () => {
      this.props.setNumRounds(3);
      this.props.updateGameState({
        screen: 'ANSWER',
        topic: 'Star Wars',
      });
    });
  }

  leaveRoom = () => {
    this.props.updateGameState({room: ''});
    this.props.socket.emit('leaveRoom', this.props.state.room, this.props.state.username);
  }

  startGame = () => {
    this.props.socket.emit('startGame', this.props.state.room);
  }

  render() {
    const currentRoom = this.props.state.rooms[this.props.state.room] || {};
    const playersInRoom = currentRoom.players || [];

    return (
      <div>
        You're in room {this.props.state.room}! <button type="button" onClick={this.leaveRoom}>Leave Room</button>
        <h3>Players:</h3>
        <ul>
          {
            playersInRoom.map((player) => (
              <li key={player}>{player}</li>
            ))
          }
        </ul>
        {playersInRoom.length > 1 && this.props.state.isLeader && <button type="button" onClick={this.startGame}>Start</button>}
      </div>
    );
  }
}

export default Room;
