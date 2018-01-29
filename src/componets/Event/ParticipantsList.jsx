import React from "react";

import Participant from "../common/gui/Participant";

export const createParticipantsList = self => {
  return () => {
    return self.state.form.participantsList.map(participant => {
      return (
        <Participant
          key={participant.id}
          {...participant}
          onDeleteClick={self.handleParticipantDeleteClick(participant.id)}
        />
      );
    });
  };
};
