import React from "react";
import PropTypes from "prop-types";

import DayPickerInput from "react-day-picker/DayPickerInput";
import "react-day-picker/lib/style.css";
import "./daypicker.css";
import { formatDate, parseDate } from "react-day-picker/moment";

const DatePickerInput = props => {
  const { value, onChange, dayPickerProps } = props;
  return (
    <div className="calendar-input">
      <DayPickerInput
        onDayChange={onChange}
        formatDate={formatDate}
        parseDate={parseDate}
        value={value}
        dayPickerProps={dayPickerProps}
      />
    </div>
  );
};

DatePickerInput.propTypes = {
  // name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  dayPickerProps: PropTypes.object
};

export default DatePickerInput;
