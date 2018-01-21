import React, { Component, Fragment } from "react";
import { withRouter } from "react-router-dom";
import { graphql } from "react-apollo";
import gql from "graphql-tag";
import moment from "moment-timezone";

import InputLabel from "../common/gui/InputLabel";
import ClearableInput from "../common/gui/ClearableInput";
import ParticipantsInput from "../common/gui/ParticipantsInput";
import Participant from "../common/gui/Participant";
import DatePickerInput from "../common/gui/DatePickerInput";
import RecomendedRoom from "../common/gui/RecomendedRoom";
import TimeInput from "../common/gui/TimeInput";
import CloseIcon from "../common/icons/CloseIcon";
import LayoutEdit from "./LayoutEdit";

import { ModalDelete } from "../common/Modals";

const EVENT_QUERY = gql`
  query EventQuery($id: ID!) {
    event(id: $id) {
      title
      dateStart
      dateEnd
      users {
        id
        login
        avatarUrl
      }
      room {
        id
        title
        floor
      }
    }
  }
`;
const round5 = x => {
  return Math.ceil(x / 5) * 5;
};

class Event extends Component {
  constructor(props) {
    super(props);
    const now = moment();
    now.minute(round5(now.minute()));
    const timeStartDefault = now;
    const timeEndDefault = now.clone().add(15, "minute");

    this.state = {
      form: {
        topic: { value: "", errors: null },
        date: { value: "", errors: null },
        timeStart: { value: timeStartDefault, errors: null },
        timeEnd: { value: timeEndDefault, errors: null },
        participantsInput: { value: "", errors: null },
        participantsList: [],
        room: null
      },
      deleteAlertModal: false
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.data.loading !== this.props.data.loading) {
      this.hydrateStateWithData();
    }
  }

  hydrateStateWithData() {
    const { event } = this.props.data;
    this.setState(prevState => {
      const newState = {
        form: {
          ...prevState.form,
          topic: { value: event.title },
          date: { value: moment(event.dateStart) },
          timeStart: { value: moment(event.dateStart) },
          timeEnd: { value: moment(event.dateEnd) },
          participantsList: event.users,
          room: event.room
        }
      };
      return newState;
    });
  }

  // handleCloseClick() {
  //   const closeIcon = withRouter(({ history }) => {
  //     return (
  //       <div class="form-header__close" onClick={history.push("/")}>
  //         <CloseIcon className="form-header__close-icon" />
  //       </div>
  //     );
  //   });
  //   const colseButton = withRouter(({ history }) => {
  //     return (
  //       <button class="btn btn--cancel" onClick={history.push("/")}>
  //         Отмена
  //       </button>
  //     );
  //   });
  //   const deleteEventButtonMobile = ({ history }) => {
  //     return (
  //       <button
  //         class="delete-meeting__button"
  //         onClick={() => {
  //           // toggle deleteAlertModal
  //         }}
  //       >
  //         Удалить встречу
  //       </button>
  //     );
  //   };
  //   const deleteEventButtonDescktop = ({ history }) => {
  //     <button
  //       class="btn btn--cancel btn--desktop-only"
  //       onClick={() => {
  //         // toggle deleteAlertModal
  //       }}
  //     >
  //       Удалить встречу
  //     </button>;
  //   };
  //   const saveButton = withRouter(({ history }) => {
  //     <button
  //       class="btn btn--cancel"
  //       onClick={() => {
  //         // create new / update
  //         // toggle modal on home if new created
  //         // redirect to home
  //         history.push("/");
  //       }}
  //     >
  //       Сохранить
  //     </button>;
  //   });
  // }

  toggleDeleteArlertModal = () => {
    this.setState(prevState => ({
      deleteAlertModal: !prevState.deleteAlertModal
    }));
  };

  createCloseClickHandler = () => () => {
    const { history } = this.props;
    history.push("/");
  };
  createDeleteClickHandler = () => e => {
    e.preventDefault();
    this.toggleDeleteArlertModal();
  };
  createDeleteConfirmClickHandler = () => () => {
    // send delete request
    const { history } = this.props;
    history.push("/");
  };
  createSumbitClickHandler = () => () => {
    // send update request
    const { history } = this.props;
    history.push("/");
  };

  handleTextInputChange = e => {
    console.log(e.key);
    const { target: { name, value } } = e;
    console.log(name, value);
    this.setState(prevState => {
      return {
        form: {
          ...prevState.form,
          [name]: {
            value,
            errors: null
          }
        }
      };
    });
  };

  handleTimeInputChange = name => value => {
    this.setState(prevState => {
      return {
        form: {
          ...prevState.form,
          [name]: {
            value,
            errors: null
          }
        }
      };
    });
  };

  handleDateInputChange = value => {
    this.setState(prevState => {
      return {
        form: {
          ...prevState.form,
          date: {
            value: moment(value),
            errors: null
          }
        }
      };
    });
  };

  handleClearClick = name => e => {
    this.setState(prevState => {
      return {
        form: {
          ...prevState.form,
          [name]: {
            value: "",
            errors: null
          }
        }
      };
    });
  };

  createTopicInput = options => {
    return () => {
      const id = "topic";
      const name = "topic";
      const labelText = "Тема";
      return (
        <Fragment>
          <InputLabel id={id} text={labelText} />
          <ClearableInput
            id={id}
            name={name}
            value={this.state.form[name].value}
            onChange={this.handleTextInputChange}
            onClearClick={this.handleClearClick(name)}
            placeholder="О чем будем говорить?"
            // clear="true"
          />
        </Fragment>
      );
    };
  };

  createDateInput = () => {
    return () => {
      const id = "date";
      const name = "date";
      const labelText = "Дата и Время";
      return (
        <Fragment>
          <InputLabel id={id} text={labelText} />
          <DatePickerInput
            id={id}
            name={name}
            value={this.state.form[name].value}
            onChange={this.handleDateInputChange}
            dayPickerProps={{
              disabledDays: [
                {
                  before: new Date()
                }
              ]
            }}
          />
        </Fragment>
      );
    };
  };

  createTimeInput = (id, name = id) => {
    return () => {
      return (
        <TimeInput
          id={id}
          name={name}
          value={this.state.form[name].value}
          onChange={this.handleTimeInputChange(name)}
        />
      );
    };
  };

  createParticipantsInput = () => () => {
    const id = "participantsInput";
    const name = "participantsInput";
    const labelText = "Участники";
    return (
      <Fragment>
        <InputLabel id={id} text={labelText} />
        <ParticipantsInput
          id={id}
          name={name}
          value={this.state.form[name].value}
          onChange={this.handleTextInputChange}
          onClearClick={this.handleClearClick(name)}
        />
      </Fragment>
    );
  };

  createParticipantsList = () => () => {
    const deletePraticipantClickHandler = id => () => {
      this.setState(prevState => {
        return {
          form: {
            ...prevState.form,
            participantsList: prevState.form.participantsList.filter(
              participant => participant.id !== id
            )
          }
        };
      });
    };
    return this.state.form.participantsList.map(participant => {
      return (
        <Participant
          {...participant}
          onDeleteClick={deletePraticipantClickHandler(participant.id)}
        />
      );
    });
  };

  handleEventEdit() {
    return (
      <LayoutEdit
        topicInput={this.createTopicInput()}
        dateInput={this.createDateInput()}
        timeStartInput={this.createTimeInput("timeStart")}
        timeEndInput={this.createTimeInput("timeEnd")}
        participantsInput={this.createParticipantsInput()}
        participantsList={this.createParticipantsList()}
        onCloseClick={this.createCloseClickHandler()}
        onDeleteClick={this.createDeleteClickHandler()}
        onSubmitClick={this.createSumbitClickHandler()}
        modal={{
          visible: this.state.deleteAlertModal,
          onConfirmClick: this.createDeleteConfirmClickHandler(),
          onCancelClick: this.toggleDeleteArlertModal
        }}
      />
    );
  }
  render() {
    const { match: { params: { id } } } = this.props;
    if (id) {
      return this.handleEventEdit();
    } else {
      return <p>new...</p>;
    }
  }
}

const queryOptions = {
  options: props => ({ variables: { id: props.match.params.id } }),
  skip: props => !props.match.params.id
};

Event = graphql(EVENT_QUERY, queryOptions)(Event);

export default Event;
