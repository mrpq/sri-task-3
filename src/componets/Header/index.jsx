import React from "react";
import { Link } from "react-router-dom";
import LogoIcon from "../common/icons/LogoIcon";

const Header = props => {
  return (
    <header className="main-heading">
      <div className="main-heading__logo">
        <LogoIcon className="main-heading__logo-icon" />
      </div>
      <div className="main-heading__create-meeting">
        <Link to="/event/create">
          <button className="btn">Создать встречу</button>
        </Link>
      </div>
    </header>
  );
};

export default Header;
