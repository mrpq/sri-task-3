import React from "react";
import PropTypes from "prop-types";

import ParticipantsDropdown from "./ParticipantsDropdown";

const ParticipantsInput = props => {
  const {
    value,
    onChange,
    onClearClick,
    onDropdownItemClick,
    usersAlreadyInList
  } = props;
  const id = "participantsInput";
  const name = "participantsInput";
  const labelText = "Участники";
  return (
    <ParticipantsDropdown
      id={id}
      labelText={labelText}
      name={name}
      value={value}
      onChange={onChange}
      onClearClick={onClearClick(name)}
      onDropdownItemClick={onDropdownItemClick}
      placeholder="Например, Рик Санчез"
      usersAlreadyInList={usersAlreadyInList}
    />
  );
};

ParticipantsInput.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onDropdownItemClick: PropTypes.func.isRequired,
  usersAlreadyInList: PropTypes.array
};

export const createParticipantsInput = eventComponent => {
  return () => (
    <ParticipantsInput
      value={eventComponent.state.form.participantsInput}
      onChange={eventComponent.handleTextInputChange}
      onClearClick={eventComponent.handleClearClick}
      onDropdownItemClick={eventComponent.handleDropdownItemClick}
      usersAlreadyInList={eventComponent.state.form.participantsList}
    />
  );
};

export default ParticipantsInput;
