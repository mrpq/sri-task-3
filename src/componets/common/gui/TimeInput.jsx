import React from "react";
import PropTypes from "prop-types";
import cn from "classnames";

import TimePicker from "rc-time-picker";
// import moment from "moment";
import "rc-time-picker/assets/index.css";
import "./timepicker.css";

const TimeInput = props => {
  const { id, name, value, onChange } = props;
  const classNames = cn({ "time-picker--error": value.errors });
  return (
    // <div
    <TimePicker
      className={classNames}
      id={id}
      name={name}
      disabledHours={() => {
        return [0, 1, 2, 3, 4, 5, 6, 7, 23];
      }}
      showSecond={false}
      minuteStep={5}
      defaultValue={value.value}
      value={value.value}
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
