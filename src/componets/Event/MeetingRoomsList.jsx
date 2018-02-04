import React from "react";

import RecommendedRooms from "./RecommendedRooms";

export const createMeetingroomsList = eventComponent => {
  return () => {
    const {
      events: { events = [] },
      rooms: { rooms = [] },
      match: { params: { eventId } }
    } = eventComponent.props;
    let eventsToWorkWith = events;
    if (eventId) {
      eventsToWorkWith = eventsToWorkWith.filter(event => event.id !== eventId);
    }
    return (
      <RecommendedRooms
        dateStart={eventComponent.state.form.dateStart.value}
        dateEnd={eventComponent.state.form.dateEnd.value}
        events={eventsToWorkWith}
        rooms={rooms}
        members={eventComponent.state.form.participantsList}
        selectedRoom={eventComponent.state.form.room}
        onRoomClick={eventComponent.handleRoomClick}
        onRoomDeleteClick={eventComponent.handleRoomDeleteClick}
      />
    );
  };
};
