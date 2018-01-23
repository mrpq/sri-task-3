import React from "react";
import PropTypes from "prop-types";
import LogoIcon from "../common/icons/LogoIcon";

const Header = props => {
  return (
    <header className="main-heading">
      <div className="main-heading__logo">
        <LogoIcon className="main-heading__logo-icon" />
      </div>
      <div className="main-heading__create-meeting">
        <button className="btn">Создать встречу</button>
      </div>
    </header>
  );
};

Header.propTypes = {};

export default Header;
