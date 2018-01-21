import React from "react";
import PropTypes from "prop-types";

import CloseIcon from "../icons/CloseIcon";

const Participant = props => {
  const { name, avatarUrl, onDeleteClick } = props;
  const style = avatarUrl ? { backgroundImage: `url("${avatarUrl}")` } : {};
  return (
    <li class="participants__item">
      <div className="participant">
        <div className="participant__ava" style={style} />
        <div className="participant__name">{name}</div>
        <div className="participant__delete" onClick={onDeleteClick}>
          <CloseIcon className="participant__delete-icon" />
        </div>
      </div>
    </li>
  );
};

Participant.propTypes = {
  name: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  onDeleteClick: PropTypes.func.isRequired
};

export default Participant;
