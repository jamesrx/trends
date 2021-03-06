import React from 'react';
import PropTypes from 'prop-types';
import screens from '../../screenTypes';
import AnswerField from '../AnswerField';
import answerFieldStyle from '../../styles/answerField.scss';

class AnswerScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeLeft: 60, // time to answer, in seconds
      submittedAnswer: false,
      acceptedAnswer: false,
      duplicateAnswer: false,
      invalidAnswer: true,
    };

    const { state } = this.props;
    this.keyword = '';
    this.roundNum = state.rounds.length;
    this.roundTimer = null;
    this.termRefs = {};
    this.minAnswerLength = 3;
    this.maxAnswerLength = 20;
  }

  componentDidMount = () => {
    const {
      socket,
      setFullResults,
      updateTotalScore,
      updateGameState,
    } = this.props;

    this.termRefs.before.focus();

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
      this.setState({ acceptedAnswer: true });
    });

    this.roundTimer = setInterval(() => {
      const {
        timeLeft,
        acceptedAnswer,
      } = this.state;
      const newTimeLeft = timeLeft - 1;

      if (newTimeLeft) {
        this.setState({ timeLeft: newTimeLeft });
      } else if (!acceptedAnswer) {
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

  submitHandler = (event) => {
    event.preventDefault();

    const activeInputName = this.termRefs.before.classList.contains(answerFieldStyle.disabled) ? 'after' : 'before';
    const term = this.termRefs[activeInputName].value;
    const fullTerm = activeInputName === 'before' ? `${term} ${this.keyword}` : `${this.keyword} ${term}`;

    this.sendAnswerData(term, fullTerm);
  }

  updateInvalidAnswer = (isValid) => {
    this.setState({
      invalidAnswer: !isValid,
    });
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

    const answerProps = {
      refs: this.termRefs,
      onFocus: this.toggleDisabledInput,
      updateInvalidAnswer: this.updateInvalidAnswer,
      minLength: this.minAnswerLength,
      maxLength: this.maxAnswerLength,
      disabled: submittedAnswer,
    };

    return (
      <>
        <h3>
          {`Round: ${this.roundNum + 1} / ${state.rooms[state.roomName].numRounds}`}
        </h3>

        <p>
          {'Round ends in '}
          <b>{timeLeft}</b>
          {timeLeft === 1 ? ' second' : ' seconds'}
        </p>

        <ul className="instructions">
          <li>Create a phrase by adding a word before or after the starting word!</li>
          <li>Click on the space before or after the starting word and start typing</li>
          <li>
            Tip: Your phrase doesn&apos;t have to be related to the topic &mdash;
            it can be anything that would be popular in Google
          </li>
        </ul>

        <h3>Your Search Term:</h3>
        <form
          onSubmit={this.submitHandler}
        >
          <AnswerField
            type="before"
            {...answerProps}
          />

          <span>{this.keyword}</span>

          <AnswerField
            type="after"
            {...answerProps}
          />

          {
            !submittedAnswer && !invalidAnswer && (
              <button
                type="submit"
                onClick={this.submitHandler}
              >
                Submit Answer!
              </button>
            )
          }
        </form>

        {invalidAnswer && (
          <p>{`Answer must be between ${this.minAnswerLength} and ${this.maxAnswerLength} characters long`}</p>
        )}

        {acceptedAnswer && <p>Waiting on other players to answer</p>}
        {duplicateAnswer && <p>Another player already answered with that. Try another term.</p>}
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
