import React from "react";

import RoomsItem from "./RoomsItem";

const RoomsList = ({ rooms }) => {
  return (
    <ul className="floor__rooms-list">
      {rooms.map(room => {
        return <RoomsItem key={room.id} room={room} />;
      })}
    </ul>
  );
};

export default RoomsList;
