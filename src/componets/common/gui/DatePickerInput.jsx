import React from "react";
import PropTypes from "prop-types";

const DatePickerInput = props => {
  const { id, name, value, onChange } = props;
  return (
    <div className="calendar-input">
      <input
        type="date"
        id={id}
        name={name}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

DatePickerInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default DatePickerInput;
