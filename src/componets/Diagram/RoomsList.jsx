import React from "react";

import RoomsItem from "./RoomsItem";

const RoomsList = ({ rooms, currentDate }) => {
  return (
    <ul className="floor__rooms-list">
      {rooms.map(room => {
        return (
          <RoomsItem key={room.id} room={room} currentDate={currentDate} />
        );
      })}
    </ul>
  );
};

export default RoomsList;
