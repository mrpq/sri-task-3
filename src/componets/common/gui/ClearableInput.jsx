import React, { Component } from "react";
import PropTypes from "prop-types";

import CloseIcon from "../icons/CloseIcon";

class ClearableInput extends Component {
  render() {
    const {
      placeholder,
      value,
      id,
      name,
      onChange,
      clear,
      onClearClick
    } = this.props;
    return (
      <div className="clearable-input">
        <input
          type="text"
          id={id}
          value={value}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
        />
        <div
          className="clearable-input__clear clearable-input__clear--visible"
          onClick={onClearClick}
        >
          {value.length > 0 ? (
            <CloseIcon className="clearable-input__clear-icon" />
          ) : null}
        </div>
      </div>
    );
  }
}

ClearableInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onClearClick: PropTypes.func.isRequired,
  clear: PropTypes.bool
};

export default ClearableInput;
