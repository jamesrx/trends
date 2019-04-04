import React from 'react';
import PropTypes from 'prop-types';
import style from '../styles/answerField.scss';

class AnswerField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
    };
    this.hideRef = React.createRef();
  }

  componentDidMount = () => {
    const {
      type,
      refs,
    } = this.props;

    this.ref = refs[type];
  }

  resizeInput = () => {
    this.ref.style.width = `${this.hideRef.current.offsetWidth}px`;
  }

  validateAnswer = () => {
    const { value } = this.state;
    const isValid = value.length < 3 || value.length > 20;
    const { updateValidFields } = this.props;

    updateValidFields(isValid);
  }

  changeHandler = (event) => {
    const filteredInput = event.target.value.replace(/\s/g, '');

    this.setState({
      value: filteredInput,
    }, () => {
      this.resizeInput();
      this.validateAnswer();
    });
  }

  toggleDisabledInput = () => {
    const {
      refs,
      type,
    } = this.props;
    const oppositeInput = refs[type === 'before' ? 'after' : 'before'];

    this.ref.classList.remove(style.disabled);
    oppositeInput.classList.add(style.disabled);

    // re-validate the field gaining focus
    this.validateAnswer();
  }

  render() {
    const {
      type,
      refs,
      disabled,
    } = this.props;
    const {
      value,
    } = this.state;
    const hideStyle = {
      position: 'absolute',
      height: 0,
      overflow: 'hidden',
      whiteSpace: 'pre',
    };

    return (
      <>
        <span
          style={hideStyle}
          ref={this.hideRef}
        >
          {value}
        </span>

        <input
          name="terms"
          value={value}
          disabled={disabled ? 'disabled' : ''}
          className={`${type} ${style.answerField}`}
          ref={(el) => { refs[type] = el; }} // eslint-disable-line no-param-reassign
          onChange={this.changeHandler}
          onFocus={this.toggleDisabledInput}
        />
      </>
    );
  }
}

AnswerField.propTypes = {
  type: PropTypes.string.isRequired,
  refs: PropTypes.object.isRequired,
  updateValidFields: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

AnswerField.defaultProps = {
  disabled: false,
};

export default AnswerField;
