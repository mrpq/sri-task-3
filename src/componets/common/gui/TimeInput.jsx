import React from "react";
import PropTypes from "prop-types";

import TimePicker from "rc-time-picker";
// import moment from "moment";
import "rc-time-picker/assets/index.css";
import "./timepicker.css";

const TimeInput = props => {
  const { id, name, value, defaultValue, onChange } = props;
  return (
    // <div
    <TimePicker
      id={id}
      name={name}
      disabledHours={() => {
        return [0, 1, 2, 3, 4, 5, 6, 7, 23];
      }}
      showSecond={false}
      minuteStep={5}
      defaultValue={defaultValue}
      value={value}
      onChange={onChange}
    />
  );
};
TimeInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
  onChange: PropTypes.func.isRequired
};

// export default TimeInput;
export default TimeInput;
