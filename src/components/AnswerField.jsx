import React from 'react';
import PropTypes from 'prop-types';
import style from '../styles/answerField.scss';

const AnswerField = ({
  type,
  refs,
  onKeyUp,
  onKeyDown,
  onFocus,
}) => (
  <span // eslint-disable-line jsx-a11y/no-static-element-interactions
    contentEditable="true"
    name="terms"
    className={`${type} ${style.answerField}`}
    ref={(el) => { refs[type] = el; }} // eslint-disable-line no-param-reassign
    onKeyUp={onKeyUp}
    onKeyDown={onKeyDown}
    onFocus={onFocus}
  />
);

AnswerField.propTypes = {
  type: PropTypes.string.isRequired,
  refs: PropTypes.object.isRequired,
  onKeyUp: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
};

export default AnswerField;
