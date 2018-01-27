import React, { Component } from "react";
import PropTypes from "prop-types";
import cn from "classnames";

import CloseIcon from "../icons/CloseIcon";

class ClearableInput extends Component {
  render() {
    const { placeholder, value, id, name, onChange, onClearClick } = this.props;
    const errors =
      typeof value === "object" && value.errors ? value.errors : false;
    return (
      <div className="clearable-input">
        <input
          className={cn({ "input--error": errors })}
          type="text"
          id={id}
          value={typeof value === "object" ? value.value : value}
          name={name}
          placeholder={placeholder}
          onChange={onChange}
        />
        <div
          className="clearable-input__clear clearable-input__clear--visible"
          onClick={onClearClick}
        >
          {value ? <CloseIcon className="clearable-input__clear-icon" /> : null}
        </div>
      </div>
    );
  }
}

ClearableInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onChange: PropTypes.func.isRequired,
  onClearClick: PropTypes.func.isRequired
};

export default ClearableInput;
