import React from "react";

import RecommendedRooms from "./RecommendedRooms";

export const createMeetingroomsList = self => {
  return () => {
    const {
      events: { events = [] },
      rooms: { rooms = [] },
      match: { params: { eventId } }
    } = self.props;
    let eventsToWorkWith = events;
    if (eventId) {
      eventsToWorkWith = eventsToWorkWith.filter(event => event.id !== eventId);
    }
    return (
      <RecommendedRooms
        dateStart={self.state.form.dateStart.value}
        dateEnd={self.state.form.dateEnd.value}
        events={eventsToWorkWith}
        rooms={rooms}
        members={self.state.form.participantsList}
        selectedRoom={self.state.form.room}
        onRoomClick={self.handleRoomClick}
        onRoomDeleteClick={self.handleRoomDeleteClick}
      />
    );
  };
};
