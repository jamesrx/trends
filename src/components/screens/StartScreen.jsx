import React from 'react';
import style from '../../styles/StartScreen.scss';
import screens from '../../screenTypes';

class StartScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      username: '',
      duplicateUsername: false,
      invalidUsername: true,
    };
  }

  componentDidMount = () => {
    this.props.socket.on('player.duplicateUsername', () => {
      this.setState({ duplicateUsername: true });
    });

    this.props.socket.on('player.invalidUsername', () => {
      this.setState({ invalidUsername: true });
    });

    this.props.socket.on('player.acceptedUsername', () => {
      this.props.updateGameState({
        screen: screens.LOBBY,
        username: this.state.username
      });
    });
  }

  submitUsername = () => {
    this.props.socket.emit('submitUsername', this.state.username);
  }

  onUsernameChange = (event) => {
    const username = event.target.value;
    const trimmedUsername = username.trim();
    let invalidUsername = trimmedUsername.length < 3 || trimmedUsername.length > 20;

    this.setState({
      username,
      invalidUsername,
      duplicateUsername: false
    });
  }

  render() {
    return (
      <div>
        Enter your name: <input type="text" className={this.state.invalidUsername ? style.invalid : null} value={this.state.username} onChange={this.onUsernameChange} />
        <button type="button" disabled={this.state.invalidUsername || this.state.duplicateUsername ? 'disabled' : ''} onClick={this.submitUsername}>Connect</button>
        {this.state.invalidUsername && <div>Enter a name between 3-20 characters</div>}
        {this.state.duplicateUsername && <div>That name's already in use</div>}
      </div>
    );
  }
}

export default StartScreen;
