import React from 'react';
import PropTypes from 'prop-types';
import screens from '../../screenTypes';

class AnswerScreen extends React.Component {
  constructor(props) {
    super(props);
    const { state } = this.props;
    this.state = {
      timeLeft: 15, // time to answer, in seconds
      submittedAnswer: false,
      acceptedAnswer: false,
      duplicateAnswer: false,
      invalidAnswer: false,
    };

    this.keyword = '';
    this.roundNum = state.rounds.length;
    this.roundTimer = null;
    this.termRefs = {};
  }

  componentDidMount = () => {
    const {
      socket,
      setFullResults,
      updateTotalScore,
      updateGameState,
    } = this.props;

    socket.on('room.submitAnswer', (rounds, fullResults) => {
      // all players' answers are in
      setFullResults(fullResults);
      updateTotalScore(rounds[rounds.length - 1]);
      updateGameState({
        screen: screens.RESULT,
        rounds,
      });
    });

    socket.on('player.duplicateAnswer', () => {
      this.setState({
        submittedAnswer: false,
        duplicateAnswer: true,
      });
    });

    socket.on('player.invalidAnswer', () => {
      this.setState({
        submittedAnswer: false,
        invalidAnswer: true,
      });
    });

    socket.on('player.acceptedAnswer', () => {
      clearInterval(this.roundTimer);
      this.setState({ acceptedAnswer: true });
    });

    this.roundTimer = setInterval(() => {
      const { timeLeft } = this.state;
      const newTimeLeft = timeLeft - 1;

      if (newTimeLeft) {
        this.setState({ timeLeft: newTimeLeft });
      } else {
        this.sendAnswerData();
      }
    }, 1000); // count down every second
  }

  componentWillUnmount = () => {
    const { socket } = this.props;

    clearInterval(this.roundTimer);
    socket.off('room.submitAnswer');
    socket.off('player.duplicateAnswer');
    socket.off('player.invalidAnswer');
    socket.off('player.acceptedAnswer');
  }

  sendAnswerData = (term = '', fullTerm = '') => {
    const {
      socket,
      state,
    } = this.props;

    this.setState({
      submittedAnswer: true,
      duplicateAnswer: false,
    });

    socket.emit(
      'submitAnswer',
      term,
      fullTerm,
      state.username,
      this.roundNum,
      state.roomName,
    );
  }

  submitAnswer = (event) => {
    event.preventDefault();

    const activeInputName = this.termRefs.before.classList.contains('disabled') ? 'after' : 'before';
    const term = this.termRefs[activeInputName].textContent.trim();
    const fullTerm = activeInputName === 'before' ? `${term} ${this.keyword}` : `${this.keyword} ${term}`;

    this.sendAnswerData(term, fullTerm);
  }

  toggleDisabledInput = (el) => {
    const oppositeInput = this.termRefs[el.classList.contains('before') ? 'after' : 'before'];

    el.classList.remove('disabled');
    oppositeInput.classList.add('disabled');
  }

  validateAnswer = (event) => {
    const answerLength = event.target.innerText.trim().length;
    const invalidAnswer = answerLength < 3 || answerLength > 20;

    this.setState({ invalidAnswer });
  }

  onFocusHandler = (event) => {
    this.validateAnswer(event);
    this.toggleDisabledInput(event.target);
  }

  render() {
    const {
      topics,
      state,
    } = this.props;

    const keywords = topics[state.rooms[state.roomName].topic] || [];
    this.keyword = keywords[this.roundNum];

    const {
      submittedAnswer,
      timeLeft,
      invalidAnswer,
      acceptedAnswer,
      duplicateAnswer,
    } = this.state;

    const termInput = {
      borderBottom: '1px solid black',
      display: 'inline-block',
      minWidth: '10px',
      margin: '0px 3px',
    };

    return (
      <>
        <h3>
          Round:
          {this.roundNum + 1}
          /
          {state.rooms[state.roomName].numRounds}
        </h3>
        {!submittedAnswer && (
          <div>
            You have
            <b>{timeLeft}</b>
            seconds to answer!
          </div>
        )}
        <form onSubmit={this.submitAnswer}>
          <div>
            Search term:
            <span
              contentEditable="true"
              name="terms"
              className="before"
              style={termInput}
              ref={(el) => { this.termRefs.before = el; }}
              onInput={this.validateAnswer}
              onFocus={this.onFocusHandler}
            />
            {this.keyword}
            <span
              contentEditable="true"
              name="terms"
              className="after"
              style={termInput}
              ref={(el) => { this.termRefs.after = el; }}
              onInput={this.validateAnswer}
              onFocus={this.onFocusHandler}
            />
          </div>

          {invalidAnswer && <p>Answer must be between 3 and 20 characters long</p>}
          {!submittedAnswer && !invalidAnswer && <button type="submit">Go!</button>}
          <p>
            {acceptedAnswer ? 'Waiting on other players to answer' : ''}
          </p>
          {duplicateAnswer && <p>Another player already answered with that. Try another term.</p>}
        </form>
      </>
    );
  }
}

AnswerScreen.propTypes = {
  state: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired,
  setFullResults: PropTypes.func.isRequired,
  updateTotalScore: PropTypes.func.isRequired,
  updateGameState: PropTypes.func.isRequired,
  topics: PropTypes.object.isRequired,
};

export default AnswerScreen;
