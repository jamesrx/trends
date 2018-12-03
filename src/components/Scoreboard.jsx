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
            Object.keys(this.props.totalScore).map((player) => (
              <li key={player}>{player}: {this.props.totalScore[player]}</li>
            ))
          }
        </ul>
      </div>
    );
  }
}

export default Scoreboard;
