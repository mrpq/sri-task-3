import React, { Fragment } from "react";
import PropTypes from "prop-types";
import MomentLocaleUtils, { formatDate } from "react-day-picker/moment";
import moment from "moment-timezone";
import "moment/locale/ru";

import InputLabel from "../common/gui/InputLabel";
import DatePickerInput from "../common/gui/DatePickerInput";

const DateInput = props => {
  const { value, onChange } = props;
  const id = "date";
  const name = "date";
  const labelText = "Дата и Время";
  return (
    <Fragment>
      <InputLabel id={id} text={labelText} />
      <DatePickerInput
        id={id}
        name={name}
        value={formatDate(moment(value), "LL", "ru")}
        onChange={onChange}
        dayPickerProps={{
          selectedDays: new Date(value),
          locale: "ru",
          localeUtils: MomentLocaleUtils,
          disabledDays: [
            {
              before: new Date()
            }
          ]
        }}
      />
    </Fragment>
  );
};

export const createDateInput = self => {
  return () => (
    <DateInput
      value={self.state.form.date.value}
      onChange={self.handleDateInputChange}
    />
  );
};

DateInput.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired
};

export default DateInput;
