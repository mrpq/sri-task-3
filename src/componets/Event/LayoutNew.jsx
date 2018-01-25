import React, { Fragment } from "react";
import PropTypes from "prop-types";

import { ModalDelete } from "../common/Modals";
import LayoutCommon from "./LayoutCommon";

const LayoutEdit = props => {
  const { onCancelClick, onDeleteClick, onCloseClick, onSubmitClick } = props;
  return (
    <Fragment>
      <form onSubmit={e => e.preventDefault()}>
        <LayoutCommon {...props} />

        <div className="form-container__row-2">
          <div className="form-container" />
          <div className="form-container__row-2">
            <div className="form__controls form__controls--fixed">
              <div className="form__notification">Выберите переговорку</div>
              <button
                type="button"
                className="btn btn--cancel btn--desktop-only"
                onClick={onCancelClick}
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

LayoutEdit.propTypes = {
  onCloseClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onSubmitClick: PropTypes.func.isRequired
};

export default LayoutEdit;
