import React from 'react';
import screens from '../../screenTypes';

class AnswerScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timeLeft: 15, // time to answer, in seconds
      submittedAnswer: false,
      acceptedAnswer: false,
      duplicateAnswer: false,
      validInput: false,
    }

    this.keyword = '';
    this.roundNum = this.props.state.rounds.length;
    this.roundTimer = null;
    this.termRefs = {};
  }

  componentDidMount = () => {
    this.props.socket.on('room.submitAnswer', (rounds, fullResults) => {
      // all players' answers are in
      this.props.setFullResults(fullResults);
      this.props.updateTotalScore(rounds[rounds.length - 1]);
      this.props.updateGameState({
        screen: screens.RESULT,
        rounds,
      });
    });

    this.props.socket.on('player.duplicateAnswer', () => {
      this.setState({
        submittedAnswer: false,
        duplicateAnswer: true,
      });
    });

    this.props.socket.on('player.acceptedAnswer', () => {
      clearInterval(this.roundTimer);
      this.setState({ acceptedAnswer: true });
    });

    this.roundTimer = setInterval(() => {
      let newTimeLeft = this.state.timeLeft - 1;

      if (newTimeLeft) {
        this.setState({ timeLeft: newTimeLeft });  
      } else {
        this.sendAnswerData();
      }
    }, 1000); // count down every second
  }

  componentWillUnmount = () => {
    clearInterval(this.roundTimer);
    this.props.socket.off('room.submitAnswer');
    this.props.socket.off('player.duplicateAnswer');
    this.props.socket.off('player.acceptedAnswer');
  }

  sendAnswerData = (term = '', fullTerm = '') => {
    this.setState({
      submittedAnswer: true,
      duplicateAnswer: false,
    });

    this.props.socket.emit(
      'submitAnswer',
      term,
      fullTerm,
      this.props.state.username,
      this.roundNum,
      this.props.state.roomName
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
    const oppositeInput = this.termRefs[el.classList.contains('before') ? 'after' : 'before' ];

    el.classList.remove('disabled');
    oppositeInput.classList.add('disabled');
  }

  validateInput = (event) => {
    const isValid = event.target.innerText.trim().length > 2;

    this.setState({validInput: isValid});
  }

  onFocusHandler = (event) => {
    this.validateInput(event);
    this.toggleDisabledInput(event.target);
  }

  render() {
    const termInput = {
      borderBottom: '1px solid black',
      display: 'inline-block',
      minWidth: '10px',
      margin: '0px 3px',
    };
    const keywords = this.props.topics[this.props.state.rooms[this.props.state.roomName].topic] || [];
    this.keyword = keywords[this.roundNum];

    return (
      <div id="answerscreen">
        <h3>Round: {this.roundNum + 1} / {this.props.state.rooms[this.props.state.roomName].numRounds}</h3>
        {!this.state.submittedAnswer && <div>You have <b>{this.state.timeLeft}</b> seconds to answer!</div>}
        <form onSubmit={this.submitAnswer}>
          <div>
            Search term:
            <span contentEditable="true" name="terms" className="before" style={termInput} ref={(el) => { this.termRefs.before = el }} onInput={this.validateInput} onFocus={this.onFocusHandler}></span>
            {this.keyword}
            <span contentEditable="true" name="terms" className="after" style={termInput} ref={(el) => { this.termRefs.after = el }} onInput={this.validateInput} onFocus={this.onFocusHandler}></span>
          </div>
          {!this.state.submittedAnswer && this.state.validInput && <button type="submit">Go!</button>}
          <div>{this.state.acceptedAnswer ? 'Waiting on other players to answer' : ''}</div>
          {this.state.duplicateAnswer && <div>Another player already answered with that. Try another term.</div>}
        </form>
      </div>
    );
  }
}

export default AnswerScreen;
