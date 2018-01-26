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
import RecommendedRooms from "./RecommendedRooms";
import TimeInput from "../common/gui/TimeInput";
import LayoutEdit from "./LayoutEdit";
import { round5 } from "../../utils/";
import LayoutNew from "./LayoutNew";

const EVENTS_QUERY = gql`
  query EventEvents {
    events {
      id
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
        capacity
      }
    }
  }
`;
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
        homeFloor
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
  query EventRooms {
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
    const { currentDate, event, match: { params: { eventId } } } = this.props;
    const { dateStart, dateEnd } = this.createDefaultDates();
    let room = null;
    let participantsList = [];
    if (eventId && !event.loading) {
      room = event.event.room;
      participantsList = event.event.users;
    }
    this.state = {
      form: {
        title: { value: "", errors: null },
        date: { value: currentDate, errors: null },
        dateStart: { value: dateStart, errors: null },
        dateEnd: { value: dateEnd, errors: null },
        participantsInput: { value: "", errors: null },
        participantsList: participantsList,
        addedParticipantsIdsList: [],
        deletedParticipantsIdsList: [],
        room: room
      },
      deleteAlertModal: false
      // recommendedRooms: []
    };
  }
  componentWillReceiveProps(nextProps) {
    const { match: { params: { roomId } } } = this.props;
    if (roomId) {
      if (nextProps.rooms.loading === false) {
        const room = nextProps.rooms.rooms.find(
          room => parseInt(room.id, 10) === parseInt(roomId, 10)
        );
        this.setState(prevState => ({
          ...prevState,
          form: {
            ...prevState.form,
            room
          }
        }));
      }
    }
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
    }
  }

  hydrateStateWithDataOnEdit() {
    const { match: { path } } = this.props;
    if (!path.includes("edit")) return;
    const { event: { event } } = this.props;
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
        }
        // recommendedRooms: [event.room]
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
      ? moment(parseInt(timeStart, 10))
      : currentDate.clone().minute(round5(currentDate.minute())); //currentDate.clone().hour(;
    const dateEnd = timeEnd
      ? moment(parseInt(timeEnd, 10))
      : dateStart.add(15, "minutes");
    return { dateStart, dateEnd };
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
    const { removeEvent, match: { params: { eventId } } } = this.props;
    removeEvent({ variables: { eventId } }).then(res => {
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
      match: { params: { eventId }, path }
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
          eventId,
          title: this.state.form.title.value,
          dateStart: dateStart,
          dateEnd: dateEnd
        }
      });
      this.state.form.addedParticipantsIdsList.forEach(userId => {
        addUserToEvent({
          variables: {
            eventId,
            userId: userId
          }
        });
      });
      this.state.form.deletedParticipantsIdsList.forEach(userId => {
        removeUserFromEvent({
          variables: {
            eventId,
            userId: userId
          }
        });
      });
      changeEventRoom({
        variables: {
          eventId,
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
      })
        .then(res => {
          const { history } = this.props;
          history.push("/");
          return res;
        })
        .then(() => {
          const { setModalCreateData, toggleModalCreate } = this.props;
          setModalCreateData({
            dateStart: this.state.form.dateStart.value,
            dateEnd: this.state.form.dateEnd.value,
            room: this.state.form.room
          });
          toggleModalCreate();
        });
    }
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
      const newDate = moment(value);
      return {
        ...prevState,
        form: {
          ...prevState.form,
          date: {
            value: moment(value),
            errors: null
          },
          dateStart: {
            value: prevState.form.dateStart.value
              .clone()
              .year(newDate.year())
              .month(newDate.month())
              .date(newDate.date())
          },
          dateEnd: {
            value: prevState.form.dateEnd.value
              .clone()
              .year(newDate.year())
              .month(newDate.month())
              .date(newDate.date())
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

  handleRoomClick = id => () => {
    this.setState(prevState => {
      const room = this.props.rooms.rooms.filter(room => room.id === id)[0];
      return {
        ...prevState,
        form: {
          ...prevState.form,
          room: room
        }
      };
    });
  };
  handleRoomDeleteClick = () => {
    this.setState(prevState => {
      return {
        ...prevState,
        form: {
          ...prevState.form,
          room: null
        }
      };
    });
  };

  createCommonInputsAndHandlers() {
    const { events: { events = [] }, rooms: { rooms = [] } } = this.props;
    return {
      titleInput: this.createTitleInput(),
      dateInput: this.createDateInput(),
      dateStartInput: this.createTimeInput("dateStart"),
      dateEndInput: this.createTimeInput("dateEnd"),
      participantsInput: this.createParticipantsInput(),
      participantsList: this.createParticipantsList(),
      meetingRoomsList: () => {
        return (
          <RecommendedRooms
            dateStart={this.state.form.dateStart.value}
            dateEnd={this.state.form.dateEnd.value}
            events={events}
            rooms={rooms}
            members={this.state.form.participantsList}
            selectedRoom={this.state.form.room}
            onRoomClick={this.handleRoomClick}
            onRoomDeleteClick={this.handleRoomDeleteClick}
          />
        );
      },
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
    const { match: { params: { eventId }, path } } = this.props;
    const isEditing = path.includes("edit");
    if (isEditing && eventId) {
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

Event = compose(
  graphql(EVENTS_QUERY, { name: "events" }),
  graphql(ROOMS_QUERY, { name: "rooms" }),
  graphql(EVENT_QUERY, {
    options: props => ({ variables: { id: props.match.params.eventId } }),
    name: "event",
    skip: props => !props.match.params.eventId
  }),
  graphql(EVENT_UPDATE, {
    options: props => ({
      variables: { id: props.match.params.eventId },
      refetchQueries: ["RoomsItemEvents, EventEvents"]
    }),
    name: "updateEvent",
    skip: props => !props.match.params.eventId
  }),
  graphql(EVENT_USER_ADD, {
    name: "addUserToEvent",
    skip: props => !props.match.params.eventId,
    options: {
      refetchQueries: ["RoomsItemEvents", "EventEvents"]
    }
  }),
  graphql(EVENT_USER_REMOVE, {
    name: "removeUserFromEvent",
    skip: props => !props.match.params.eventId,
    options: {
      refetchQueries: ["RoomsItemEvents", "EventEvents"]
    }
  }),
  graphql(EVENT_ROOM_CHANGE, {
    name: "changeEventRoom",
    options: {
      refetchQueries: ["RoomsItemEvents", "EventEvents"]
    }
  }),
  graphql(EVENT_CREATE, {
    name: "createEvent",
    options: {
      refetchQueries: ["RoomsItemEvents", "EventEvents"]
    }
  }),
  graphql(EVENT_DELETE, {
    name: "removeEvent"
    // options: {
    //   refetchQueries: ["RoomsItemEvents", "EventEvents"]
    // }
  })
)(Event);

export default Event;
