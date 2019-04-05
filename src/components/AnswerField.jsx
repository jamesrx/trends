import React from 'react';
import PropTypes from 'prop-types';
import style from '../styles/answerField.scss';

class AnswerField extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      isValid: false,
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
    // add one to account for offsetWidth using the floor value
    this.ref.style.width = `${this.hideRef.current.offsetWidth + 1}px`;
  }

  validateAnswer = () => {
    const { value } = this.state;
    const {
      updateValidFields,
      minLength,
      maxLength,
    } = this.props;
    const isValid = !(value.length < minLength || value.length > maxLength);

    this.setState({ isValid });
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
      isValid,
    } = this.state;
    const hideStyle = {
      position: 'absolute',
      height: 0,
      overflow: 'hidden',
      whiteSpace: 'pre',
    };

    return (
      <>
        {/* hidden span as a way to scale the input field to the correct width */}
        <span
          style={hideStyle}
          className={style.answerFieldText}
          ref={this.hideRef}
        >
          {value}
        </span>

        <input
          name="terms"
          value={value}
          autoComplete="off"
          disabled={disabled ? 'disabled' : ''}
          className={`${type} ${style.answerField} ${style.answerFieldText} ${isValid ? '' : 'invalid'}`}
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
  minLength: PropTypes.number,
  maxLength: PropTypes.number,
};

AnswerField.defaultProps = {
  disabled: false,
  minLength: 0,
  maxLength: Number.MAX_SAFE_INTEGER,
};

export default AnswerField;
