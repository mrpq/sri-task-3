import React from "react";
import PropTypes from "prop-types";
import cn from "classnames";

import CloseIcon from "../icons/CloseIcon";

const RecomendedRoom = props => {
  const { dateStart, dateEnd, room, selected, onDeleteClick } = props;
  const classNames = cn({
    "meeting-output": true,
    "meeting-output--selected": selected
  });
  return (
    <div className={classNames}>
      <div className="meeting-output__hours">
        <span className="meeting-output__start">{dateStart}</span>
        <span>—</span>
        <span className="meeting-output__end">{dateEnd}</span>
      </div>
      <div className="meeting-output__room">&nbsp;&nbsp;{room.title}</div>
      <div className="meeting-output__floor">
        &nbsp;&middot; {room.floor} этаж{" "}
      </div>
      {onDeleteClick ? (
        <div className="meeting-output__delete" onClick={onDeleteClick}>
          <CloseIcon className="meeting-output__delete-icon" color="#fff" />
        </div>
      ) : null}
    </div>
  );
};

RecomendedRoom.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.number,
    title: PropTypes.string,
    capacity: PropTypes.number,
    floor: PropTypes.number
  }).isRequired,
  dateStart: PropTypes.string.isRequired,
  dateEnd: PropTypes.string.isRequired
  // roomName: PropTypes.string.isRequired,
  // floor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default RecomendedRoom;
