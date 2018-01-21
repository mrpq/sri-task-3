import React from "react";
import PropTypes from "prop-types";

const TimeInput = props => {
  const { id, name, value, onChange } = props;
  return (
    <input type="time" id={id} name={name} value={value} onChange={onChange} />
  );
};

TimeInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

export default TimeInput;
