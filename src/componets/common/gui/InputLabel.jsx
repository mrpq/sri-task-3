import React from "react";
import PropTypes from "prop-types";

const InputLabel = props => {
  const { id, text } = props;
  return (
    <label className="formfield-label" htmlFor={id}>
      {text}
    </label>
  );
};

InputLabel.propTypes = {
  id: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired
};

export default InputLabel;
