import React, { Fragment } from "react";
import PropTypes from "prop-types";

import { ModalDelete, ModalUpdate } from "../common/Modals";
import LayoutCommon from "./LayoutCommon";

const LayoutEdit = props => {
  const {
    onDeleteClick,
    onCloseClick,
    onSubmitClick,
    modalDelete,
    modalUpdate
  } = props;
  return (
    <div className="page__wrapper">
      <form onSubmit={e => e.preventDefault()}>
        <LayoutCommon
          {...props}
          editPageDeleteSection={() => (
            <Fragment>
              <div className="delete-meeting">
                <button
                  type="button"
                  className="delete-meeting__button"
                  onClick={onDeleteClick}
                >
                  Удалить встречу
                </button>
              </div>
              <div className="delimiter" />
            </Fragment>
          )}
        />

        <div className="form-container__row-2">
          <div className="form__controls">
            <button
              type="button"
              className="btn btn--cancel"
              onClick={onCloseClick}
            >
              Отмена
            </button>
            <button
              type="button"
              className="btn btn--cancel btn--desktop-only"
              onClick={onDeleteClick}
            >
              Удалить встречу
            </button>
            <button
              type="button"
              className="btn btn--cancel"
              onClick={onSubmitClick}
            >
              Сохранить
            </button>
          </div>
        </div>
      </form>
      <ModalDelete {...modalDelete} />
      <ModalUpdate {...modalUpdate} />
    </div>
  );
};

LayoutEdit.propTypes = {
  onCloseClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onSubmitClick: PropTypes.func.isRequired,
  modalDelete: PropTypes.shape({
    visible: PropTypes.bool,
    onCancelClick: PropTypes.func.isRequired,
    onConfirmClick: PropTypes.func.isRequired
  }),
  modalUpdate: PropTypes.shape({
    visible: PropTypes.bool,
    onSubmitClick: PropTypes.func.isRequired
  })
};

export default LayoutEdit;
