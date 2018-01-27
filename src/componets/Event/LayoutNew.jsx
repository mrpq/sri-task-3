import React, { Fragment } from "react";
import PropTypes from "prop-types";

import LayoutCommon from "./LayoutCommon";

const LayoutNew = props => {
  const { onCloseClick, onSubmitClick, roomChecked } = props;
  const specialStyle = { paddingBottom: "110px" };
  return (
    <Fragment>
      <form onSubmit={e => e.preventDefault()}>
        <LayoutCommon {...props} specialStyle={specialStyle} />

        <div className="form-container__row-2">
          <div className="form-container" />
          <div className="form-container__row-2">
            <div className="form__controls form__controls--fixed">
              <div
                className="form__notification"
                style={{
                  display: roomChecked ? "none" : "block"
                }}
              >
                Выберите переговорку
              </div>
              <button
                type="button"
                className="btn btn--cancel btn--desktop-only"
                onClick={onCloseClick}
              >
                Отмена
              </button>
              <button
                className="btn btn--longer btn--create-mobile"
                onClick={onSubmitClick}
              >
                Создать встречу
              </button>
            </div>
          </div>
        </div>
      </form>
    </Fragment>
  );
};

LayoutNew.propTypes = {
  onCloseClick: PropTypes.func.isRequired,
  onSubmitClick: PropTypes.func.isRequired
};

export default LayoutNew;
