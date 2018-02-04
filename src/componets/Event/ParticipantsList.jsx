import React from "react";

import Participant from "../common/gui/Participant";

export const createParticipantsList = eventComponent => {
  return () => {
    return eventComponent.state.form.participantsList.map(participant => {
      return (
        <Participant
          key={participant.id}
          {...participant}
          onDeleteClick={eventComponent.handleParticipantDeleteClick(
            participant.id
          )}
        />
      );
    });
  };
};
