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
    this.minUsernameLength = 3;
    this.maxUsernameLength = 20;
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
    const invalidUsername = trimmedUsernameLength < this.minUsernameLength
      || trimmedUsernameLength > this.maxUsernameLength;

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
        <div className={style.logo}>
          <div className={style.trends}>
            {'Trends'.split('').map(letter => (
              <span key={letter} className={style[letter]}>{letter}</span>
            ))}
          </div>
          <img className={style.arrow} src="/src/trends-arrow.png" alt="Arrow Logo" />
        </div>

        <h3>How to Play</h3>

        <ul className="instructions">
          <li>
            Create or join a room with 2-5 people to start a game
            (or open the game in another tab to play by yourself)
          </li>
          <li>You&apos;ll be given a starting word related to the chosen topic</li>
          <li>
            Add a new word before or after the starting word to create a two word phrase
            (your word can be anything, it doesn&apos;t nedd to be related to the topic)
          </li>
          <li>Your score is based on how popular the phrase is in Google</li>
        </ul>

        <p>
          Enter your name:
          <input
            type="text"
            className={invalidUsername ? 'invalid' : null}
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

        {invalidUsername && (
          <div>{`Enter a name between ${this.minUsernameLength}-${this.maxUsernameLength} characters`}</div>
        )}
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
