import React from 'react';

class Scoreboard extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount = () => {
  }

  render() {
    return (
      <div>
        <h3>Scoreboard:</h3>
        <ul>
          {
            this.props.rooms[this.props.roomName].players.map((player) => (
              <li key={player.socketId}>{player.username}: {this.props.totalScore[player.username]}</li>
            ))
          }
        </ul>
      </div>
    );
  }
}

export default Scoreboard;
