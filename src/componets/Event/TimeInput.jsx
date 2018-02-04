import React from "react";
import TimeInput from "../common/gui/TimeInput";

export const createTimeInput = (eventComponent, id, name = id) => {
  const defaultDate =
    name === "dateStart"
      ? eventComponent.state.form.dateStart
      : eventComponent.state.form.dateEnd;
  return () => {
    return (
      <TimeInput
        id={id}
        name={name}
        // defaultValue={defaultDate}
        value={defaultDate}
        onChange={eventComponent.handleTimeInputChange(name)}
      />
    );
  };
};
