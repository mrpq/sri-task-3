import React from "react";
import PropTypes from "prop-types";

const Button = props => {
  return <button className={props.calssName}>{props.children}</button>;
};

Button.propTypes = {};

export default Button;
