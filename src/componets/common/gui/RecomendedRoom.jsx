import React from "react";
import PropTypes from "prop-types";

const RecomendedRoom = props => {
  const { startTime, endTime, roomName, floor } = props;
  return (
    <div className="meeting-output">
      <div className="meeting-output__hours">
        <span className="meeting-output__start">{startTime}</span>
        <span>—</span>
        <span className="meeting-output__end">{endTime}</span>
      </div>
      <div className="meeting-output__room">&nbsp;&nbsp;{roomName}</div>
      <div className="meeting-output__floor">&nbsp;&middot; {floor} этаж </div>
      <div className="meeting-output__delete" />
    </div>
  );
};

RecomendedRoom.propTypes = {
  startTime: PropTypes.string.isRequired,
  endTime: PropTypes.string.isRequired,
  roomName: PropTypes.string.isRequired,
  floor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default RecomendedRoom;
