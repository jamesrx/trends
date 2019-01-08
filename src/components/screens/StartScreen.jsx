import React from 'react';
import PropTypes from 'prop-types';
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
    this.usernameRef = React.createRef();
  }

  componentDidMount = () => {
    const {
      socket,
      updateGameState,
    } = this.props;

    this.usernameRef.current.focus();

    socket.on('player.duplicateUsername', () => {
      this.setState({ duplicateUsername: true });
    });

    socket.on('player.invalidUsername', () => {
      this.setState({ invalidUsername: true });
    });

    socket.on('player.acceptedUsername', () => {
      const { username } = this.state;
      updateGameState({
        screen: screens.LOBBY,
        username,
      });
    });
  }

  componentWillUnmount = () => {
    const { socket } = this.props;

    socket.off('player.duplicateUsername');
    socket.off('player.invalidUsername');
    socket.off('player.acceptedUsername');
  }

  submitUsername = () => {
    const { socket } = this.props;
    const { username } = this.state;

    socket.emit('submitUsername', username);
  }

  submitUsernameOnKeyPress = (event) => {
    if (event.which === 13) {
      this.submitUsername();
    }
  }

  onUsernameChange = (event) => {
    const username = event.target.value;
    const trimmedUsernameLength = username.trim().length;
    const invalidUsername = trimmedUsernameLength < 3 || trimmedUsernameLength > 20;

    this.setState({
      username,
      invalidUsername,
      duplicateUsername: false,
    });
  }

  render() {
    const {
      invalidUsername,
      username,
      duplicateUsername,
    } = this.state;

    return (
      <>
        {/* <div className={style.logo}>
          <div className={style.trends}>
            {'Trends'.split('').map(letter => (
              <span key={letter} className={style[letter]}>{letter}</span>
            ))}
          </div>
          <img className={style.arrow} src="/src/trends-arrow.png" alt="Arrow Logo" />
        </div> */}

        <p>
          Enter your name:
          <input
            type="text"
            className={invalidUsername ? style.invalid : null}
            value={username}
            onChange={this.onUsernameChange}
            onKeyDown={this.submitUsernameOnKeyPress}
            ref={this.usernameRef}
          />
        </p>

        <button
          type="button"
          disabled={invalidUsername || duplicateUsername ? 'disabled' : ''}
          onClick={this.submitUsername}
        >
          Connect
        </button>

        {invalidUsername && <div>Enter a name between 3-20 characters</div>}
        {duplicateUsername && <div>That name is already in use</div>}
      </>
    );
  }
}

StartScreen.propTypes = {
  socket: PropTypes.object.isRequired,
  updateGameState: PropTypes.func.isRequired,
};

export default StartScreen;
