import React, { Component } from "react";
import { Route, Redirect } from "react-router-dom";
import { graphql, compose } from "react-apollo";

import moment from "moment-timezone";
import "moment/locale/ru";

import LayoutEdit from "./LayoutEdit";
import LayoutNew from "./LayoutNew";
import {
  createDefaultDates,
  checkFieldsErrors,
  checkSameRoomRecommendationExistForNewDate
} from "./utils";

import { createTitleInput } from "./TitleInput";
import { createDateInput } from "./DateInput";
import { createTimeInput } from "./TimeInput";
import { createParticipantsInput } from "./ParticipantsInput";
import { createParticipantsList } from "./ParticipantsList";
import { createMeetingroomsList } from "./MeetingRoomsList";
import * as queries from "./queries";

class Event extends Component {
  constructor(props) {
    super(props);
    const {
      currentDate,
      event,
      rooms,
      match: { params: { eventId, roomId, timeStart, timeEnd } }
    } = this.props;
    let title = "";
    let date = currentDate;
    let participantsList = [];
    let { dateStart, dateEnd } = createDefaultDates(
      currentDate,
      timeStart,
      timeEnd
    );
    let room = null;
    if (eventId && !event.loading) {
      title = event.event.title;
      date = moment(event.event.dateStart);
      dateStart = moment(event.event.dateStart);
      dateEnd = moment(event.event.dateEnd);
      participantsList = event.event.users;
      room = event.event.room;
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
      deleteAlertModal: false,
      updateSuccessModal: false
    };
  }
  toggleFieldsErrors(fieldNames) {
    this.setState(prevState => {
      const errorFields = fieldNames.reduce((acc, fieldName) => {
        return {
          ...acc,
          [fieldName]: { ...prevState.form[fieldName], errors: true }
        };
      }, {});
      return {
        ...prevState,
        form: {
          ...prevState.form,
          ...errorFields
        }
      };
    });
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
    const { match: { path }, event: { event } } = this.props;
    if (!path.includes("edit")) return;
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

  toggleDeleteArlertModal = () => {
    this.setState(prevState => ({
      deleteAlertModal: !prevState.deleteAlertModal
    }));
  };

  toggleUpdadeSuccessModal = () => {
    this.setState(prevState => ({
      updadeSuccessModal: !prevState.updadeSuccessModal
    }));
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

  handleParticipantDeleteClick = id => () => {
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
  handleCloseClick = () => {
    const { history } = this.props;
    history.push("/");
  };
  handleDeleteClick = e => {
    e.preventDefault();
    this.toggleDeleteArlertModal();
  };
  handleDeleteConfirmClick = () => {
    // send delete request
    const { removeEvent, match: { params: { eventId } } } = this.props;
    removeEvent({ variables: { id: eventId } }).then(res => {
      const { history } = this.props;
      history.push("/");
    });
  };
  handleSubmitClick = e => {
    // send update request
    e.preventDefault();
    if (!this.canSubmit()) return;
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
    )
      .then(res => {
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
          });
        }
      })
      .then(res => {
        if (!isEditing) {
          const { history } = this.props;
          history.push("/");
        }
      })
      .then(() => {
        if (isEditing) {
          this.toggleUpdadeSuccessModal();
        } else {
          const { setModalCreateData, toggleModalCreate } = this.props;
          setModalCreateData({
            dateStart: this.state.form.dateStart.value,
            dateEnd: this.state.form.dateEnd.value,
            room: this.state.form.room.value
          });
          toggleModalCreate();
        }
      });
  };
  canSubmit() {
    const fields = checkFieldsErrors(this.state.form);
    const canSubmit = fields.every(e => e.ok);
    if (canSubmit) {
      return true;
    } else {
      this.toggleFieldsErrors(
        fields.reduce((acc, field) => {
          return !field.ok ? [...acc, field.fieldName] : acc;
        }, [])
      );
      return false;
    }
  }

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
    if (value === null) {
      return;
    }
    const recommendation = checkSameRoomRecommendationExistForNewDate(
      value,
      name,
      this.state.form,
      this.props
    );
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
    const recommendation = checkSameRoomRecommendationExistForNewDate(
      value,
      undefined,
      this.state.form,
      this.props
    );
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

  createCommonInputsAndHandlers() {
    return {
      titleInput: createTitleInput(this),
      dateInput: createDateInput(this),
      dateStartInput: createTimeInput(this, "dateStart"),
      dateEndInput: createTimeInput(this, "dateEnd"),
      participantsInput: createParticipantsInput(this),
      participantsList: createParticipantsList(this),
      meetingRoomsList: createMeetingroomsList(this),
      onCloseClick: this.handleCloseClick,
      onDeleteClick: this.handleDeleteClick,
      onSubmitClick: this.handleSubmitClick
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
      // redirect to homepage if event not found
      return <Route render={() => <Redirect to="/" />} />;
    }
    const commonInputsAndHandlers = this.createCommonInputsAndHandlers();
    return (
      <LayoutEdit
        title="Редактирование Встречи"
        {...commonInputsAndHandlers}
        modalDelete={{
          visible: this.state.deleteAlertModal,
          onConfirmClick: this.handleDeleteConfirmClick,
          onCancelClick: this.toggleDeleteArlertModal
        }}
        modalUpdate={{
          visible: this.state.updadeSuccessModal,
          onSubmitClick: this.toggleUpdadeSuccessModal
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
  graphql(queries.EVENTS_QUERY, { name: "events" }),
  graphql(queries.ROOMS_QUERY, { name: "rooms" }),
  graphql(queries.EVENT_QUERY, {
    options: props => ({ variables: { id: props.match.params.eventId } }),
    name: "event",
    skip: props => !props.match.params.eventId
  }),
  graphql(queries.EVENT_UPDATE, {
    options: props => ({
      variables: { id: props.match.params.eventId },
      refetchQueries: ["RoomsItemEvents, EventEvents"]
    }),
    name: "updateEvent",
    skip: props => !props.match.params.eventId
  }),
  graphql(queries.EVENT_USER_ADD, {
    name: "addUserToEvent",
    skip: props => !props.match.params.eventId,
    options: {
      refetchQueries: ["RoomsItemEvents", "EventEvents"]
    }
  }),
  graphql(queries.EVENT_USER_REMOVE, {
    name: "removeUserFromEvent",
    skip: props => !props.match.params.eventId,
    options: {
      refetchQueries: ["RoomsItemEvents", "EventEvents"]
    }
  }),
  graphql(queries.EVENT_ROOM_CHANGE, {
    name: "changeEventRoom",
    options: {
      refetchQueries: ["RoomsItemEvents", "EventEvents"]
    }
  }),
  graphql(queries.EVENT_CREATE, {
    name: "createEvent",
    options: {
      refetchQueries: ["RoomsItemEvents", "EventEvents"]
    }
  }),
  graphql(queries.EVENT_DELETE, {
    name: "removeEvent",
    options: {
      refetchQueries: ["RoomsItemEvents", "EventEvents"]
    }
  })
)(Event);

export default Event;
