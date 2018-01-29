import React from "react";
import TimeInput from "../common/gui/TimeInput";

export const createTimeInput = (self, id, name = id) => {
  const defaultDate =
    name === "dateStart" ? self.state.form.dateStart : self.state.form.dateEnd;
  return () => {
    return (
      <TimeInput
        id={id}
        name={name}
        // defaultValue={defaultDate}
        value={defaultDate}
        onChange={self.handleTimeInputChange(name)}
      />
    );
  };
};
