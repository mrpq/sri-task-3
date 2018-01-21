import React from "react";
import PropTypes from "prop-types";

export const ModalDelete = ({ onCancelClick, onConfirmClick, visible }) => {
  const styles = {
    display: visible ? "block" : "none"
  };
  return (
    <div className="modal-container" style={styles}>
      <div className="modal">
        <div className="modial__icon-container" />
        <div className="modal__info">
          <strong className="modal__title">
            Встреча будет удалена безвозвратно
          </strong>
        </div>
        <div className="modal__cta">
          <button className="btn btn--cancel" onClick={onCancelClick}>
            Отмена
          </button>
          <button className="btn btn--cancel" onClick={onConfirmClick}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

ModalDelete.propTypes = {
  visible: PropTypes.bool,
  onCancelClick: PropTypes.func.isRequired,
  onConfirmClick: PropTypes.func.isRequired
};

export const ModalCreate = ({ onSubmitClick }) => {
  return (
    <div className="modal-container">
      <div className="modal">
        <div className="modial__icon-container" />
        <div className="modal__info">
          <strong className="modal__title">Встеча создана!</strong>
          <div className="modal__details">
            <div className="modal__date-time">
              <span className="modal__date">14 декабря,</span>
              <span className="modal__time">15:00—17:00</span>
            </div>
            <div className="modal__room">
              <span className="modal__room-name">Готем &middot; </span>
              <span className="modal__floor">4этаж</span>
            </div>
          </div>
        </div>
        <div className="modal__cta">
          <button className="btn" onClick={onSubmitClick}>
            Хорошо
          </button>
        </div>
      </div>
    </div>
  );
};

ModalCreate.propTypes = {
  onSubmitClick: PropTypes.func.isRequired
};
