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
import {
  getRecommendation,
  prepareRawEventsForGetRecommendation,
  prepareRawRoomsForGetRecommendation
} from "../../utils/getRecommendation";

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
      id
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
        capacity
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
    const {
      currentDate,
      event,
      rooms,
      match: { params: { eventId, roomId } }
    } = this.props;
    let { dateStart, dateEnd } = this.createDefaultDates();
    let room = null;
    let participantsList = [];
    let title = "";
    let date = currentDate;
    if (eventId && !event.loading) {
      room = event.event.room;
      participantsList = event.event.users;
      title = event.event.title;
      date = moment(event.event.dateStart);
      dateStart = moment(event.event.dateStart);
      dateEnd = moment(event.event.dateEnd);
    }
    if (roomId && !rooms.loading) {
      room = rooms.rooms.find(
        room => parseInt(room.id, 10) === parseInt(roomId, 10)
      );
    }
    this.state = {
      form: {
        title: { value: title, errors: null },
        date: { value: date, errors: null },
        dateStart: { value: dateStart, errors: null },
        dateEnd: { value: dateEnd, errors: null },
        participantsInput: { value: "", errors: null },
        participantsList: participantsList,
        addedParticipantsIdsList: [],
        deletedParticipantsIdsList: [],
        room: { value: room, errors: null }
      },
      deleteAlertModal: false
    };
  }
  toggleFieldsErrors(fieldNames) {
    // console.log(fieldNames);
    this.setState(prevState => {
      const errorFields = fieldNames.reduce((acc, fn) => {
        return { ...acc, [fn]: { ...prevState.form[fn], errors: true } };
      }, {});
      // console.log(errorFields);
      return {
        ...prevState,
        form: {
          ...prevState.form,
          ...errorFields
        }
      };
    });
  }
  canSubmit() {
    const titleOk = {
      fieldName: "title",
      ok: this.state.form.title.value.length > 0
    };
    const participantsOk = {
      fieldName: "participantsInput",
      ok: this.state.form.participantsList.length > 0
    };
    const fields = [titleOk, participantsOk];
    const canSubmit = fields.every(e => e.ok);
    if (canSubmit) {
      return true;
    } else {
      this.toggleFieldsErrors(
        fields.reduce((acc, field) => {
          return !field.ok ? [...acc, field.fieldName] : acc;
        }, [])
      );
    }
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
          room: { value: event.room }
        }
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
  toggleUpdadeSuccessModal = () => {
    this.setState(prevState => ({
      UpdadeSuccessModal: !prevState.UpdadeSuccessModal
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
    removeEvent({ variables: { id: eventId } }).then(res => {
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
    const swaps = this.state.form.room.value.swap || [];
    Promise.all(
      swaps.map(swap => {
        // perform swaps first
        return changeEventRoom({
          variables: {
            id: swap.event,
            roomId: swap.room
          }
        });
      })
    ).then(res => {
      if (isEditing) {
        updateEvent({
          variables: {
            id: eventId,
            title: this.state.form.title.value,
            dateStart: dateStart,
            dateEnd: dateEnd
          }
        });
        this.state.form.addedParticipantsIdsList.forEach(userId => {
          addUserToEvent({
            variables: {
              id: eventId,
              userId: userId
            }
          });
        });
        this.state.form.deletedParticipantsIdsList.forEach(userId => {
          removeUserFromEvent({
            variables: {
              id: eventId,
              userId: userId
            }
          });
        });
        changeEventRoom({
          variables: {
            id: eventId,
            roomId: this.state.form.room.value.id
          }
        });
      } else {
        createEvent({
          variables: {
            title: this.state.form.title.value,
            dateStart: dateStart,
            dateEnd: dateEnd,
            usersIds: this.state.form.addedParticipantsIdsList,
            roomId: this.state.form.room.value.id
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
              room: this.state.form.room.value
            });
            toggleModalCreate();
          });
      }
    });
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

  checkSameRoomRecommendationExist = (value, name) => {
    value = moment(value);
    if (!this.state.form.room.value) return false;
    let {
      match: { path, params: { eventId } },
      events: { loading: eventsLoading, events },
      rooms: { loading: roomsLoading, rooms }
    } = this.props;
    if (eventsLoading || roomsLoading) return true;
    if (path.includes("edit")) {
      // filter editing event from db, so getRecommendation count
      // its time as free
      events = events.filter(e => parseInt(e.id, 10) !== parseInt(eventId, 10));
    }
    const db = {
      rooms: prepareRawRoomsForGetRecommendation(rooms),
      events: prepareRawEventsForGetRecommendation(events)
    };
    const date = {
      start: this.state.form.dateStart.value,
      end: this.state.form.dateEnd.value
    };
    if (name && name === "dateStart") {
      // this part is executing only when time input changed
      // needed to check if new event time fits free slot
      date.start = value;
    } else if (name && name === "dateEnd") {
      date.end = value;
    } else {
      date.start
        .year(value.year())
        .month(value.month())
        .date(value.date());
      date.end
        .year(value.year())
        .month(value.month())
        .date(value.date());
    }
    const recommendations = getRecommendation(
      date,
      this.state.form.participantsList,
      db
    );
    const sameRoomRecommendation = recommendations
      .filter(rec => !rec.asap)
      .find(rec => {
        const result =
          parseInt(this.state.form.room.value.id, 10) ===
          parseInt(rec.room, 10);
        return result;
      });
    if (sameRoomRecommendation) return sameRoomRecommendation;
  };

  handleTimeInputChange = name => value => {
    const recommendation = this.checkSameRoomRecommendationExist(value, name);
    let room = this.state.form.room.value;
    if (recommendation) {
      room = {
        ...room,
        dateStart: recommendation.date.start,
        dateEnd: recommendation.date.end,
        swap: recommendation.swap
      };
    } else {
      room = null;
    }
    this.setState(prevState => {
      return {
        form: {
          ...prevState.form,
          room: { value: room },
          [name]: {
            value,
            errors: null
          }
        }
      };
    });
  };

  handleDateInputChange = value => {
    const recommendation = this.checkSameRoomRecommendationExist(value);
    let room = this.state.form.room.value;
    if (recommendation) {
      room = {
        ...room,
        dateStart: recommendation.date.start,
        dateEnd: recommendation.date.end,
        swap: recommendation.swap
      };
    } else {
      room = null;
    }
    console.log(room);

    this.setState(prevState => {
      const newDate = moment(value);
      return {
        ...prevState,
        form: {
          ...prevState.form,
          room: { value: room },
          date: {
            value: moment(value),
            errors: null
          },
          dateStart: {
            value: room
              ? room.dateStart
              : prevState.form.dateStart.value
                  .clone()
                  .year(newDate.year())
                  .month(newDate.month())
                  .date(newDate.date())
          },
          dateEnd: {
            value: room
              ? room.dateEnd
              : prevState.form.dateEnd.value
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
        const participantsList = prevState.form.participantsList.concat(user);
        let room = prevState.form.room.value;
        if (room && room.capacity < participantsList.length) {
          room = null; //uncheck room if we added more than it can take
        }
        return {
          ...prevState,
          form: {
            ...prevState.form,
            participantsList,
            room: { value: room },
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
            value={this.state.form.title}
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
        value={this.state.form.participantsInput}
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

  handleRoomClick = room => () => {
    this.setState(prevState => {
      return {
        ...prevState,
        form: {
          ...prevState.form,
          date: { value: room.dateStart },
          dateStart: { value: room.dateStart },
          dateEnd: { value: room.dateEnd },
          room: { value: room }
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
          room: { value: null }
        }
      };
    });
  };

  createCommonInputsAndHandlers() {
    const {
      events: { events = [] },
      rooms: { rooms = [] },
      match: { params: { eventId } }
    } = this.props;
    return {
      titleInput: this.createTitleInput(),
      dateInput: this.createDateInput(),
      dateStartInput: this.createTimeInput("dateStart"),
      dateEndInput: this.createTimeInput("dateEnd"),
      participantsInput: this.createParticipantsInput(),
      participantsList: this.createParticipantsList(),
      meetingRoomsList: () => {
        let eventsToWorkWith = events;
        if (eventId) {
          eventsToWorkWith = eventsToWorkWith.filter(
            event => event.id !== eventId
          );
        }
        return (
          <RecommendedRooms
            dateStart={this.state.form.dateStart.value}
            dateEnd={this.state.form.dateEnd.value}
            events={eventsToWorkWith}
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
    return (
      <LayoutNew
        {...commonInputsAndHandlers}
        roomChecked={this.state.form.room.value}
        title="Новая встреча"
      />
    );
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
    name: "removeEvent",
    options: {
      refetchQueries: ["RoomsItemEvents", "EventEvents"]
    }
  })
)(Event);

export default Event;
