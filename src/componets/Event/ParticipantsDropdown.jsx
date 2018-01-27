import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

import ParticipantsInput from "../common/gui/ParticipantsInput";
import InputLabel from "../common/gui/InputLabel";

const USERS_QUERY = gql`
  query Users {
    users {
      id
      login
      homeFloor
      avatarUrl
    }
  }
`;
class ParticipantsDropdown extends Component {
  filterUsers() {
    const { data: { users }, usersAlreadyInList } = this.props;
    let { value } = this.props;
    value = typeof value === "object" ? value.value : value;
    if (value.length < 1 || !users) return [];
    const valueLowerCase = value.toLowerCase();
    const filteredUsers = users.filter(user => {
      const isAlreadyInList = usersAlreadyInList.find(
        userInList => userInList.id === user.id
      );
      const loginLowerCase = user.login.toLowerCase();
      return !isAlreadyInList && loginLowerCase.includes(valueLowerCase);
    });
    return filteredUsers;
  }
  handleItemClick = users => id => {
    const { onDropdownItemClick } = this.props;
    onDropdownItemClick(users.filter(user => user.id === id)[0]);
  };
  render() {
    const {
      id,
      name,
      labelText,
      value,
      placeholder,
      onChange,
      onClearClick,
      data: { users }
    } = this.props;
    return (
      <Fragment>
        <InputLabel id={id} text={labelText} />
        <ParticipantsInput
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          onClearClick={onClearClick}
          items={this.filterUsers()}
          placeholder={placeholder}
          onItemClick={this.handleItemClick(users)}
        />
      </Fragment>
    );
  }
}

ParticipantsDropdown.propTypes = {
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  name: PropTypes.string,
  labelText: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
  onChange: PropTypes.func.isRequired,
  onClearClick: PropTypes.func.isRequired,
  onDropdownItemClick: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  usersAlreadyInList: PropTypes.array
};

ParticipantsDropdown = graphql(USERS_QUERY)(ParticipantsDropdown);

export default ParticipantsDropdown;
