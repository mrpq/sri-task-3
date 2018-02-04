import React, { Fragment } from "react";
import PropTypes from "prop-types";

import InputLabel from "../common/gui/InputLabel";
import ClearableInput from "../common/gui/ClearableInput";

const TitleIput = props => {
  const { value, onChange, onClearClick } = props;
  const id = "title";
  const name = "title";
  const labelText = "Тема";
  return (
    <Fragment>
      <InputLabel id={id} text={labelText} />
      <ClearableInput
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onClearClick={onClearClick(name)}
        placeholder="О чем будем говорить?"
      />
    </Fragment>
  );
};

export const createTitleInput = eventComponent => {
  return () => (
    <TitleIput
      value={eventComponent.state.form.title}
      onChange={eventComponent.handleTextInputChange}
      onClearClick={eventComponent.handleClearClick}
    />
  );
};

TitleIput.propTypes = {
  value: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onClearClick: PropTypes.func.isRequired
};

export default TitleIput;
