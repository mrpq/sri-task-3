import React from "react";
import { Link, withRouter } from "react-router-dom";
import LogoIcon from "../common/icons/LogoIcon";

let Header = ({ match: { path } }) => {
  return (
    <header className="main-heading">
      <div className="main-heading__logo">
        <LogoIcon className="main-heading__logo-icon" />
      </div>
      {path === "/" ? (
        <div className="main-heading__create-meeting">
          <Link to="/event/create">
            <button className="btn">Создать встречу</button>
          </Link>
        </div>
      ) : null}
    </header>
  );
};

Header = withRouter(Header);

export default Header;
