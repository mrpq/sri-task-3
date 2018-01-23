import React, { Component, Fragment } from "react";
import { Route, Redirect } from "react-router-dom";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";

import MomentLocaleUtils, { formatDate } from "react-day-picker/moment";
import moment from "moment-timezone";
import "moment/locale/ru";

import InputLabel from "../common/gui/InputLabel";
import ClearableInput from "../common/gui/ClearableInput";
import ParticipantsDropdown from "./ParticipantsDropdown";
import Participant from "../common/gui/Participant";
import DatePickerInput from "../common/gui/DatePickerInput";
import RecomendedRoom from "../common/gui/RecomendedRoom";
import TimeInput from "../common/gui/TimeInput";
// import CloseIcon from "../common/icons/CloseIcon";
import LayoutEdit from "./LayoutEdit";
import { round5 } from "../../utils/";

// import { ModalDelete } from "../common/Modals";

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
const EVENT_UPDATE = gql`
  mutation UpdateEvent(
    $id: ID!
    $title: String!
    $dateStart: Date!
    $dateEnd: Date!
  ) {
    updateEvent(
      id: $id
      input: { title: $title, dateStart: $dateStart, dateEnd: $dateEnd }
    ) {
      id
    }
  }
`;

class Event extends Component {
  constructor(props) {
    super(props);

    const now = moment();
    now.minute(round5(now.minute()));
    const dateStartDefault = now;
    const dateEndDefault = now.clone().add(15, "minute");
    this.state = {
      form: {
        title: { value: "", errors: null },
        date: { value: "", errors: null },
        dateStart: { value: dateStartDefault, errors: null },
        dateEnd: { value: dateEndDefault, errors: null },
        participantsInput: { value: "", errors: null },
        participantsList: [],
        room: null
      },
      deleteAlertModal: false,
      meetingRooms: [],
      users: []
    };
  }

  componentDidMount() {
    this.hydrateStateWithData(); //rehydrates state if we back
    // console.log("hello");
  }
  componentDidUpdate(prevProps) {
    if (prevProps.data.loading !== this.props.data.loading) {
      this.hydrateStateWithData();
    }
  }

  hydrateStateWithData() {
    const { data: { event }, match: { path } } = this.props;
    if (!path.includes("edit") || !event) return;
    this.setState(prevState => {
      const newState = {
        ...prevState,
        form: {
          ...prevState.form,
          title: { value: event.title },
          date: { value: formatDate(moment(event.dateStart), "LL", "ru") },
          dateStart: { value: moment(event.dateStart) },
          dateEnd: { value: moment(event.dateEnd) },
          participantsList: event.users,
          room: event.room
        },
        meetingRooms: [event.room]
      };
      return newState;
    });
  }

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
    const { mutate, history, match: { params: { id } } } = this.props;
    mutate({
      variables: {
        id,
        title: this.state.form.title.value,
        dateStart: this.state.form.dateStart.value.toISOString(),
        dateEnd: this.state.form.dateEnd.value.toISOString()
      }
    });
    // history.push("/");
  };

  handleTextInputChange = e => {
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
            value: formatDate(moment(value), "LL", "ru"),
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

  handleDropdownItemClick = user => {
    const userAlreadyInList = this.state.form.participantsList.find(
      item => item.id === user.id
    );
    if (!userAlreadyInList) {
      this.setState(prevState => {
        return {
          ...prevState,
          form: {
            ...prevState.form,
            participantsList: prevState.form.participantsList.concat(user)
          }
        };
      });
    }
  };

  createTitleInput = options => {
    return () => {
      const id = "title";
      const name = "title";
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
              locale: "ru",
              localeUtils: MomentLocaleUtils,
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
      <ParticipantsDropdown
        id={id}
        labelText={labelText}
        name={name}
        value={this.state.form[name].value}
        onChange={this.handleTextInputChange}
        onClearClick={this.handleClearClick(name)}
        onDropdownItemClick={this.handleDropdownItemClick}
        placeholder="Например, Рик Санчез"
        usersAlreadyInList={this.state.form.participantsList}
      />
    );
  };

  createParticipantsList = () => () => {
    const deletePraticipantClickHandler = id => () => {
      this.setState(prevState => {
        return {
          ...prevState,
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
          key={participant.id}
          {...participant}
          onDeleteClick={deletePraticipantClickHandler(participant.id)}
        />
      );
    });
  };

  createMeetingRoomsList = () => () => {
    const handleRoomDeleteClick = () => {
      this.setState(prevState => {
        return {
          ...prevState,
          form: {
            ...prevState.form,
            room: null
          }
        };
      }); // callback needed to populate recommended rooms list
    };
    const handleRoomClick = id => () => {
      this.setState(prevState => {
        return {
          ...prevState,
          form: {
            ...prevState.form,
            room: prevState.meetingRooms.filter(room => room.id === id)[0]
          }
        };
      });
    };
    const { match: { path } } = this.props;
    const labelText = path.includes("/edit/")
      ? "Ваша переговорка"
      : "Рекомендованные переговорки";
    return (
      <Fragment>
        <InputLabel text={labelText} />
        {this.state.meetingRooms.map(room => {
          // const roomProps = {};
          const selected =
            this.state.form.room && this.state.form.room.id === room.id;
          let dateStart = "";
          let dateEnd = "";
          if (this.state.form.dateStart.value) {
            dateStart = this.state.form.dateStart.value.format("HH:mm");
          }
          if (this.state.form.dateEnd.value) {
            dateEnd = this.state.form.dateEnd.value.format("HH:mm");
          }
          return (
            <RecomendedRoom
              key={room.id}
              room={room}
              dateStart={dateStart}
              dateEnd={dateEnd}
              selected={selected}
              onClick={() => {
                !selected && handleRoomClick(room.id)();
              }}
              onDeleteClick={handleRoomDeleteClick}
            />
          );
        })}
      </Fragment>
    );
  };

  createCommonInputsAndHandlers() {
    return {
      titleInput: this.createTitleInput(),
      dateInput: this.createDateInput(),
      dateStartInput: this.createTimeInput("dateStart"),
      dateEndInput: this.createTimeInput("dateEnd"),
      participantsInput: this.createParticipantsInput(),
      participantsList: this.createParticipantsList(),
      meetingRoomsList: this.createMeetingRoomsList(),
      onCloseClick: this.createCloseClickHandler(),
      onDeleteClick: this.createDeleteClickHandler(),
      onSubmitClick: this.createSumbitClickHandler()
    };
  }
  handleEventEdit() {
    if (this.props.data.event === null) {
      return <Route render={() => <Redirect to="/" />} />;
    }
    const inputsAndHandlers = this.createCommonInputsAndHandlers();
    return (
      <LayoutEdit
        title="Редактирование Встречи"
        {...inputsAndHandlers}
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
      const { data: { loading } } = this.props;
      if (loading) {
        return <p>Loading</p>;
      }
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

Event = compose(
  graphql(EVENT_QUERY, queryOptions),
  graphql(EVENT_UPDATE, queryOptions)
)(Event);

export default Event;
