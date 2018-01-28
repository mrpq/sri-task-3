import React from "react";
import PropTypes from "prop-types";
import EmojiSuccess from "./icons/EmojiSuccess";
import EmojiAlert from "./icons/EmojiAlert";

export const ModalDelete = ({ onCancelClick, onConfirmClick, visible }) => {
  const styles = {
    display: visible ? "block" : "none"
  };
  return (
    <div className="modal-container" style={styles}>
      <div className="modal">
        <div className="modial__icon-container">
          <EmojiAlert className="modal__icon" />
        </div>
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

export const ModalCreate = ({ onSubmitClick, visible, data }) => {
  const styles = {
    display: visible ? "block" : "none"
  };
  if (!visible) return null;
  return (
    <div className="modal-container" style={styles}>
      <div className="modal">
        <div className="modial__icon-container">
          <EmojiSuccess className="modal__icon" />
        </div>
        <div className="modal__info">
          <strong className="modal__title">Встеча создана!</strong>
          <div className="modal__details">
            <div className="modal__date-time">
              <span className="modal__date">
                {`${data.dateStart.format("DD MMMM")} `}
              </span>
              <span className="modal__time">
                {data.dateStart.format("HH:mm")}—{data.dateEnd.format("HH:mm")}
              </span>
            </div>
            <div className="modal__room">
              <span className="modal__room-name">{`${data.room.title} ·`}</span>
              <span className="modal__floor">{` ${data.room.floor} этаж`}</span>
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

export const ModalUpdate = ({ onSubmitClick, visible }) => {
  const styles = {
    display: visible ? "block" : "none"
  };
  if (!visible) return null;
  return (
    <div className="modal-container" style={styles}>
      <div className="modal">
        <div className="modial__icon-container">
          <EmojiSuccess className="modal__icon" />
        </div>
        <div className="modal__info">
          <strong className="modal__title">Данные встречи обновлены</strong>
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
  onSubmitClick: PropTypes.func.isRequired,
  visible: PropTypes.bool,
  data: PropTypes.oneOfType([PropTypes.object, PropTypes.instanceOf(null)])
};
