import React, { Component } from "react";
import PropTypes from "prop-types";
import cn from "classnames";
import onClickOutside from "react-onclickoutside";

import "./participantsInput.css";
import CloseIcon from "../icons/CloseIcon";

const ParticipantsListItem = props => {
  const { onItemClick } = props;
  const { id, login, homeFloor, avatarUrl } = props.item;
  const style = avatarUrl ? { backgroundImage: `url("${avatarUrl}")` } : {};
  return (
    <li
      className="dropdown-list__item dropdown-item"
      onClick={() => {
        onItemClick(id);
      }}
    >
      <div className="dropdown-item__ava" style={style} />
      <div className="dropdown-item__name">{login}&nbsp;</div>
      <div className="dropdown-item__floor">{`· ${homeFloor} этаж`}</div>
    </li>
  );
};
ParticipantsListItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    login: PropTypes.string.isRequired,
    homeFloor: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    avatarUrl: PropTypes.string
  }),
  onItemClick: PropTypes.func.isRequired
};

class ParticipatntsDropDownList extends Component {
  constructor(props) {
    super(props);
    this.state = { visible: true };
  }

  handleClickOutside = e => {
    if (this.props.textInput !== e.targer) {
      this.props.onClickOutside();
    }
  };

  render() {
    const { items, onItemClick } = this.props;
    const classNames = cn({
      "dropdown-list": true,
      "dropdown-list--hidden": !this.props.isInputFocused
    });
    return (
      <ul className={classNames}>
        {items.map(item => {
          return (
            <ParticipantsListItem
              key={item.id}
              item={item}
              onItemClick={onItemClick}
            />
          );
        })}
      </ul>
    );
  }
}
ParticipatntsDropDownList = onClickOutside(ParticipatntsDropDownList);

class ParticipantsInput extends Component {
  constructor(props) {
    super(props);
    this.state = { isFocused: false };
  }
  // these two handlers are for dropdown list show/hide maipulation
  // when corresponding input is focused
  // or user clicked outside
  handleInputFocus = e => {
    this.setState({ isFocused: true });
  };
  handleDropdownClickOutside = () => {
    this.setState({ isFocused: false });
  };
  textInput;
  render() {
    const {
      id,
      name,
      placeholder,
      value,
      onChange,
      items,
      onClearClick,
      onItemClick
    } = this.props;
    return (
      <div className="dropdown-field" id={id} name={name}>
        <input
          type="text"
          value={value}
          name={name}
          placeholder={placeholder}
          id={id}
          onChange={onChange}
          onClick={this.handleInputFocus}
          onFocus={this.handleInputFocus}
          ref={input => {
            this.textInput = input;
          }}
        />
        {/* Only show dropdown when start typing */}
        {items && items.length > 0 ? (
          <ParticipatntsDropDownList
            items={items}
            onItemClick={onItemClick}
            onClickOutside={this.handleDropdownClickOutside}
            isInputFocused={this.state.isFocused}
            textInput={this.textInput}
          />
        ) : null}
        <div
          className="clearable-input__clear clearable-input__clear--visible"
          onClick={onClearClick}
        >
          {value && value.length >= 0 ? (
            <CloseIcon className="clearable-input__clear-icon" />
          ) : null}
        </div>
      </div>
    );
  }
}
ParticipantsInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  items: PropTypes.array,
  onClearClick: PropTypes.func,
  onItemClick: PropTypes.func
};

export default ParticipantsInput;
