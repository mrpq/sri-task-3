import React from "react";
import PropTypes from "prop-types";

import CloseIcon from "../icons/CloseIcon";

const ParticipantsListItem = props => {
  const { name, floor, avatarUrl } = props.item;
  const style = avatarUrl ? { backgroundImage: `url("${avatarUrl}")` } : {};
  return (
    <li className="dropdown-list__item dropdown-item">
      <div className="dropdown-item__ava" style={style} />
      <div className="dropdown-item__name">{name}&nbsp;</div>
      <div className="dropdown-item__floor">{`· ${floor} этаж`}</div>
    </li>
  );
};
ParticipantsListItem.propTypes = {
  item: PropTypes.shape({
    name: PropTypes.string.isRequired,
    floor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    ava: PropTypes.string
  })
};

const ParticipantsInput = props => {
  const { id, name, placeholder, value, onChange, items, onClearClick } = props;
  return (
    <div className="dropdown-field" id={id} name={name}>
      <input
        type="text"
        value={value}
        name={name}
        placeholder={placeholder}
        id={id}
        onChange={onChange}
      />
      {items && items.length > 0 ? (
        <ul className="dropdown-list">
          {items.map(item => <ParticipantsListItem item={item} />)}
        </ul>
      ) : null}
      <div
        className="clearable-input__clear clearable-input__clear--visible"
        onClick={onClearClick}
      >
        {value.length > 0 ? (
          <CloseIcon className="clearable-input__clear-icon" />
        ) : null}
      </div>
    </div>
  );
};

ParticipantsInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.array,
  onClearClick: PropTypes.func
};

export default ParticipantsInput;
