import React, { Fragment } from "react";
import PropTypes from "prop-types";

import { ModalDelete } from "../common/Modals";
import LayoutCommon from "./LayoutCommon";

const LayoutEdit = props => {
  const { onDeleteClick, onCloseClick, onSubmitClick, modal } = props;
  return (
    <Fragment>
      <form onSubmit={e => e.preventDefault()}>
        <LayoutCommon
          {...props}
          editpageDeleteSection={() => (
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
      <ModalDelete {...modal} />
    </Fragment>
  );
};

LayoutEdit.propTypes = {
  // topicInput: PropTypes.func.isRequired,
  // dateInput: PropTypes.func.isRequired,
  // dateStartInput: PropTypes.func.isRequired,
  // dateEndInput: PropTypes.func.isRequired,
  // participantsInput: PropTypes.func.isRequired,
  // participantsList: PropTypes.func.isRequired,
  // meetingRoom: PropTypes.func.isRequired,
  onCloseClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  onSubmitClick: PropTypes.func.isRequired,
  modal: PropTypes.shape({
    visible: PropTypes.bool,
    onCancelClick: PropTypes.func.isRequired,
    onConfirmClick: PropTypes.func.isRequired
  })
};

export default LayoutEdit;
