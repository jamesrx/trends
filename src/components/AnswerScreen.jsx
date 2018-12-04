import React from 'react';

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
  }

  componentDidMount = () => {
    this.props.socket.on('room.submitAnswer', (rounds) => {
      // all players' answers are in
      this.props.updateGameState({
        screen: 'RESULT',
        rounds,
      }, this.props.updateTotalScore);
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
      this.props.state.rooms[this.props.state.room].players.length,
      this.props.state.room
    );
  }

  submitAnswer = (event) => {
    event.preventDefault();
    let term = '';
    let fullTerm = '';

    event.target.childNodes.forEach((childNode) => {
      const termNodes = childNode.querySelectorAll('[name="terms"]');

      termNodes.forEach((node) => {
        if (!node.classList.contains('disabled')) {
          term = node.textContent.trim();
          fullTerm = node.classList.contains('before') ? `${term} ${this.keyword}` : `${this.keyword} ${term}`;
        }
      });
    });

    this.sendAnswerData(term, fullTerm);
  }

  disableInput = (event) => {
    const currentElement = event.target;

    if (currentElement.attributes.getNamedItem('name').value === 'terms') {
      const container = currentElement.parentElement;
      const oppositeClass = currentElement.classList.contains('before') ? 'after' : 'before';
      const oppositeInput = container.getElementsByClassName(oppositeClass)[0];

      currentElement.classList.remove('disabled');
      oppositeInput.classList.add('disabled');
    }
  }

  validateInput = (event) => {
    const input = event.target.innerText;
    const isValid = input.trim().length > 2;

    this.setState({validInput: isValid});
  }

  render() {
    const termInput = {
      borderBottom: '1px solid black',
      display: 'inline-block',
      minWidth: '10px',
      margin: '0px 3px',
    };
    const keywords = this.props.topics[this.props.state.topic] || [];
    this.keyword = keywords[this.roundNum];

    return (
      <div id="answerscreen">
        <h3>Round: {this.roundNum + 1} / {this.props.numRounds}</h3>
        {!this.state.submittedAnswer && <div>You have <b>{this.state.timeLeft}</b> seconds to answer!</div>}
        <form onSubmit={this.submitAnswer}>
          <div onFocus={this.disableInput}>
            Search term:
            <span contentEditable="true" name="terms" className="before" style={termInput} onInput={this.validateInput} onFocus={this.validateInput}></span>
            {this.keyword}
            <span contentEditable="true" name="terms" className="after" style={termInput} onInput={this.validateInput} onFocus={this.validateInput}></span>
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
