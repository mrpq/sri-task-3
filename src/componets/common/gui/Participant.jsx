import React from "react";
import PropTypes from "prop-types";

import CloseIcon from "../icons/CloseIcon";

const Participant = props => {
  const { login, avatarUrl, onDeleteClick } = props;
  const style = avatarUrl ? { backgroundImage: `url("${avatarUrl}")` } : {};
  return (
    <li className="participants__item">
      <div className="participant">
        <div className="participant__ava" style={style} />
        <div className="participant__name">{login}</div>
        <div className="participant__delete" onClick={onDeleteClick}>
          <CloseIcon className="participant__delete-icon" />
        </div>
      </div>
    </li>
  );
};

Participant.propTypes = {
  login: PropTypes.string.isRequired,
  avatarUrl: PropTypes.string,
  onDeleteClick: PropTypes.func.isRequired
};

export default Participant;
