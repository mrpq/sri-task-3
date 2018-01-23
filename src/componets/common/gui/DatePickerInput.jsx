import React from "react";
import PropTypes from "prop-types";

import DayPickerInput from "react-day-picker/DayPickerInput";
import "react-day-picker/lib/style.css";
import "./daypicker.css";
import { formatDate, parseDate } from "react-day-picker/moment";

const DatePickerInput = props => {
  const { value, onChange, dayPickerProps } = props;
  return (
    <DayPickerInput
      // onDayClick={this.handleDayClick}
      onDayChange={onChange}
      formatDate={formatDate}
      parseDate={parseDate}
      // dayPickerProps={{
      //   locale: "ru",
      //   localeUtils: MomentLocaleUtils
      // }}
      value={value}
      dayPickerProps={dayPickerProps}
      // value={value && value.format("YYYY-M-D")}
    />
  );
};

DatePickerInput.propTypes = {
  // name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  dayPickerProps: PropTypes.object
};

export default DatePickerInput;
