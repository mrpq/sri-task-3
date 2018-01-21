import React, { Fragment, Component } from "react";
import PropTypes from "prop-types";

import CloseIcon from "../common/icons/CloseIcon";
import { ModalDelete } from "../common/Modals";

class Executioner extends Component {
  render() {
    return this.props.children();
  }
}

const LayoutEdit = props => {
  const {
    topicInput,
    dateInput,
    timeStartInput,
    timeEndInput,
    participantsInput,
    participantsList,
    meetingRoom,
    onDeleteClick,
    onCloseClick,
    onSubmitClick,
    modal
  } = props;
  return (
    <Fragment>
      <form onSubmit={e => e.preventDefault()}>
        <div className="form-container__row-1">
          <div className="form-centering-container">
            <div className="fields-wrapper">
              <header className="form-header">
                <h1 className="form-header__heading">Редактирование встречи</h1>
                <div className="form-header__close" onClick={onCloseClick}>
                  <CloseIcon className="form-header__close-icon" />
                </div>
              </header>
            </div>
            <div className="fields-wrapper">
              <div className="form__row row-1">
                <div className="form__column">
                  <div className="form__field">
                    {/* <div className="clearable-input">
                <input type="text" placeholder="Тема встречи">
                <div className="clearable-input__clear clearable-input__clear--visible"></div>
              </div> */}
                    <Executioner>{topicInput}</Executioner>
                  </div>
                </div>
                <div className="form__column">
                  <div className="form__field">
                    <div className="form-column-left">
                      <div className="column-left__left">
                        <Executioner>{dateInput}</Executioner>
                      </div>
                      <div className="column-left__right">
                        <div className="form__date-range">
                          <Executioner>{timeStartInput}</Executioner>
                          <div className="form_date-range-dash">—</div>
                          <Executioner>{timeEndInput}</Executioner>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="delimiter" />
            <div className="form__row row-2">
              <div className="form__column">
                <div className="fields-wrapper">
                  <div className="form__field">
                    <Executioner>{participantsInput}</Executioner>
                  </div>
                  <div className="participants">
                    <ul className="participants__list">
                      <Executioner>{participantsList}</Executioner>
                    </ul>
                  </div>
                </div>
                <div className="delimiter" />
              </div>
              <div className="form__column">
                <div className="fields-wrapper">
                  <div className="form__field">
                    <label className="formfield-label" htmlFor="meeting">
                      Ваша переговорка
                    </label>
                    {meetingRoom}
                  </div>
                </div>
              </div>
            </div>
            <div className="delimiter" />
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
          </div>
        </div>
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
  topicInput: PropTypes.func.isRequired,
  dateInput: PropTypes.func.isRequired,
  timeStartInput: PropTypes.func.isRequired,
  timeEndInput: PropTypes.func.isRequired,
  participantsInput: PropTypes.func.isRequired,
  participantsList: PropTypes.func.isRequired,
  meetingRoom: PropTypes.func.isRequired,
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
