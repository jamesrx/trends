import React from 'react';
import style from '../../styles/startScreen.scss';
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

  componentWillUnmount = () => {
    this.props.socket.off('player.duplicateUsername');
    this.props.socket.off('player.invalidUsername');
    this.props.socket.off('player.acceptedUsername');
  }

  submitUsername = () => {
    this.props.socket.emit('submitUsername', this.state.username);
  }

  onUsernameChange = (event) => {
    const username = event.target.value;
    const trimmedUsernameLength = username.trim().length;
    const invalidUsername = trimmedUsernameLength < 3 || trimmedUsernameLength > 20;

    this.setState({
      username,
      invalidUsername,
      duplicateUsername: false
    });
  }

  render() {
    return (
      <>
        <div className={style.logo}>
          <div className={style.trends}>
            {'Trends'.split('').map((letter) => (
              <span key={letter} className={style[letter]}>{letter}</span>
            ))}
            {/* <div className={style.game}>Game</div> */}
          </div>
          <img className={style.arrow} src="/src/trends-arrow.png" />
        </div>
        <p>Enter your name: <input type="text" className={this.state.invalidUsername ? style.invalid : null} value={this.state.username} onChange={this.onUsernameChange} /></p>
        <button type="button" disabled={this.state.invalidUsername || this.state.duplicateUsername ? 'disabled' : ''} onClick={this.submitUsername}>Connect</button>
        {this.state.invalidUsername && <div>Enter a name between 3-20 characters</div>}
        {this.state.duplicateUsername && <div>That name's already in use</div>}
      </>
    );
  }
}

export default StartScreen;
