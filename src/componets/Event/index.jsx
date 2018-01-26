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
import LayoutEdit from "./LayoutEdit";
import { round5 } from "../../utils/";
import LayoutNew from "./LayoutNew";

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
const ROOMS_QUERY = gql`
  query RoomsQuery {
    rooms {
      id
      title
      capacity
      floor
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
const EVENT_USER_ADD = gql`
  mutation AddUserToEvent($id: ID!, $userId: ID!) {
    addUserToEvent(id: $id, userId: $userId) {
      id
      users {
        login
      }
    }
  }
`;
const EVENT_USER_REMOVE = gql`
  mutation RemoveUserFromEvent($id: ID!, $userId: ID!) {
    removeUserFromEvent(id: $id, userId: $userId) {
      id
      users {
        login
      }
    }
  }
`;
const EVENT_ROOM_CHANGE = gql`
  mutation ChangeEventRoom($id: ID!, $roomId: ID!) {
    changeEventRoom(id: $id, roomId: $roomId) {
      id
    }
  }
`;
const EVENT_CREATE = gql`
  mutation createEvent(
    $title: String!
    $dateStart: Date!
    $dateEnd: Date!
    $usersIds: [ID]!
    $roomId: ID!
  ) {
    createEvent(
      input: { title: $title, dateStart: $dateStart, dateEnd: $dateEnd }
      usersIds: $usersIds
      roomId: $roomId
    ) {
      id
    }
  }
`;
const EVENT_DELETE = gql`
  mutation removeEvent($id: ID!) {
    removeEvent(id: $id) {
      id
    }
  }
`;

class Event extends Component {
  constructor(props) {
    super(props);
    const { currentDate } = this.props;
    const { dateStart, dateEnd } = this.createDefaultDates();
    this.state = {
      form: {
        title: { value: "", errors: null },
        date: { value: currentDate, errors: null },
        dateStart: { value: dateStart, errors: null },
        dateEnd: { value: dateEnd, errors: null },
        participantsInput: { value: "", errors: null },
        participantsList: [],
        addedParticipantsIdsList: [],
        deletedParticipantsIdsList: [],
        room: null
      },
      deleteAlertModal: false,
      recommendedRooms: []
    };
  }

  componentDidMount() {
    // this.hydrateStateWithDataOnEdit(); //rehydrates state if we back
  }
  componentDidUpdate(prevProps) {
    const { match: { path } } = this.props;
    if (path.includes("edit")) {
      if (
        prevProps.event.loading === true &&
        this.props.event.loading === false
      ) {
        this.hydrateStateWithDataOnEdit();
      }
    } else {
      if (
        prevProps.rooms.loading === true &&
        this.props.rooms.loading === false
      ) {
        this.setState({ recommendedRooms: this.getRecommendation() });
      }
    }
  }

  hydrateStateWithDataOnEdit() {
    const { match: { path } } = this.props;
    if (!path.includes("edit")) return;
    const { event: { event, errors } } = this.props;
    this.setState(prevState => {
      const newState = {
        ...prevState,
        form: {
          ...prevState.form,
          title: { value: event.title },
          date: { value: moment(event.dateStart) },
          dateStart: { value: moment(event.dateStart) },
          dateEnd: { value: moment(event.dateEnd) },
          participantsList: event.users,
          room: event.room
        },
        recommendedRooms: [event.room]
      };
      return newState;
    });
  }

  createDefaultDates() {
    const {
      currentDate,
      match: { params: { timeStart, timeEnd } }
    } = this.props;
    const dateStart = timeStart
      ? moment(parseInt(timeStart))
      : currentDate.clone().minute(round5(currentDate.minute())); //currentDate.clone().hour(;
    const dateEnd = timeEnd
      ? moment(parseInt(timeEnd))
      : dateStart.add(15, "minutes");
    return { dateStart, dateEnd };
  }

  getRecommendation = (date, members, db) => {
    console.log(this.props.rooms);
    return this.props.rooms.rooms;
  };

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
    const { removeEvent, match: { params: { id } } } = this.props;
    removeEvent({ variables: { id } }).then(res => {
      const { history } = this.props;
      history.push("/");
    });
  };
  createSubmitClickHandler = () => () => {
    // send update request
    const {
      createEvent,
      updateEvent,
      addUserToEvent,
      removeUserFromEvent,
      changeEventRoom,
      history,
      match: { params: { id }, path }
    } = this.props;
    const isEditing = path.includes("edit");
    const dateStart = this.state.form.dateStart.value
      .date(this.state.form.date.value.date())
      .toISOString();
    const dateEnd = this.state.form.dateEnd.value
      .date(this.state.form.date.value.date())
      .toISOString();
    if (isEditing) {
      updateEvent({
        variables: {
          id,
          title: this.state.form.title.value,
          dateStart: dateStart,
          dateEnd: dateEnd
        }
      });
      this.state.form.addedParticipantsIdsList.forEach(userId => {
        addUserToEvent({
          variables: {
            id,
            userId: userId
          }
        });
      });
      this.state.form.deletedParticipantsIdsList.forEach(userId => {
        removeUserFromEvent({
          variables: {
            id,
            userId: userId
          }
        });
      });
      changeEventRoom({
        variables: {
          id,
          roomId: this.state.form.room.id
        }
      });
    } else {
      createEvent({
        variables: {
          title: this.state.form.title.value,
          dateStart: dateStart,
          dateEnd: dateEnd,
          usersIds: this.state.form.addedParticipantsIdsList,
          roomId: this.state.form.room.id
        }
      });
    }
    // history.push("/");
  };

  handleTextInputChange = e => {
    const { target: { name, value } } = e;
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
            participantsList: prevState.form.participantsList.concat(user),
            addedParticipantsIdsList: prevState.form.addedParticipantsIdsList.concat(
              user.id
            ),
            deletedParticipantsIdsList: prevState.form.deletedParticipantsIdsList.filter(
              _id => _id !== user.id
            )
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
            value={formatDate(moment(this.state.form.date.value), "LL", "ru")}
            onChange={this.handleDateInputChange}
            dayPickerProps={{
              selectedDays: new Date(this.state.form.date.value),
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
    const defaultDate =
      name === "dateStart"
        ? this.state.form.dateStart.value
        : this.state.form.dateEnd.value;
    // console.log("time Input start ", defaultDate);
    // console.log("time Input end ", defaultDate);
    return () => {
      return (
        <TimeInput
          id={id}
          name={name}
          defaultValue={defaultDate}
          value={defaultDate}
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
            ),
            deletedParticipantsIdsList: prevState.form.deletedParticipantsIdsList.concat(
              id
            ),
            addedParticipantsIdsList: prevState.form.addedParticipantsIdsList.filter(
              userId => userId !== id
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
          },
          recommendedRooms: this.getRecommendation()
        };
      }); // callback needed to populate recommended rooms list
    };
    const handleRoomClick = id => () => {
      this.setState(prevState => {
        const room = this.props.rooms.rooms.filter(room => room.id === id)[0];
        return {
          ...prevState,
          form: {
            ...prevState.form,
            room
          },
          recommendedRooms: [room]
        };
      });
    };
    // const { match: { path } } = this.props;
    const labelText = this.state.form.room
      ? "Ваша переговорка"
      : "Рекомендованные переговорки";
    return (
      <Fragment>
        <InputLabel text={labelText} />
        {this.state.recommendedRooms.map(room => {
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
      onSubmitClick: this.createSubmitClickHandler()
    };
  }
  handleEventCreate() {
    const commonInputsAndHandlers = this.createCommonInputsAndHandlers();
    return <LayoutNew {...commonInputsAndHandlers} title="Новая встреча" />;
  }
  handleEventEdit() {
    if (this.props.event.event === null) {
      return <Route render={() => <Redirect to="/" />} />;
    }
    const commonInputsAndHandlers = this.createCommonInputsAndHandlers();
    return (
      <LayoutEdit
        title="Редактирование Встречи"
        {...commonInputsAndHandlers}
        modal={{
          visible: this.state.deleteAlertModal,
          onConfirmClick: this.createDeleteConfirmClickHandler(),
          onCancelClick: this.toggleDeleteArlertModal
        }}
      />
    );
  }
  render() {
    const { match: { params: { id }, path } } = this.props;
    const isEditing = path.includes("edit");
    if (isEditing && id) {
      const { event: { loading } } = this.props;
      if (loading) {
        return <p>Loading</p>;
      }
      return this.handleEventEdit();
    } else {
      return this.handleEventCreate();
    }
  }
}

const eventQueryOptions = {
  options: props => ({
    variables: { id: props.match.params.id }
  }),
  name: "event",
  skip: props => !props.match.params.id
};

Event = compose(
  graphql(ROOMS_QUERY, { name: "rooms" }),
  graphql(EVENT_QUERY, {
    options: props => ({ variables: { id: props.match.params.id } }),
    name: "event",
    skip: props => !props.match.params.id
  }),
  graphql(EVENT_UPDATE, {
    options: props => ({ variables: { id: props.match.params.id } }),
    name: "updateEvent",
    skip: props => !props.match.params.id
  }),
  graphql(EVENT_USER_ADD, {
    // options: props => ({ variables: { id: props.match.params.id } }),
    name: "addUserToEvent",
    skip: props => !props.match.params.id
  }),
  graphql(EVENT_USER_REMOVE, {
    name: "removeUserFromEvent",
    skip: props => !props.match.params.id
  }),
  graphql(EVENT_ROOM_CHANGE, {
    name: "changeEventRoom"
  }),
  graphql(EVENT_CREATE, {
    name: "createEvent"
  }),
  graphql(EVENT_DELETE, {
    name: "removeEvent"
  })
)(Event);

export default Event;
