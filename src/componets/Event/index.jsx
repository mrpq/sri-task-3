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
import {
  updateFormForEvent,
  setFormFieldsErrors,
  updateFormParticipants,
  updateFormParticipantsOnDelete,
  updateFormOnRoomClick,
  updateFormOnTimeInputChange,
  updateFormOnDateInputChange
} from "./eventStateUpdaters";

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
      const formWithErrors = setFormFieldsErrors(fieldNames, prevState.form);
      return {
        ...prevState,
        form: formWithErrors
      };
    });
  }

  componentWillReceiveProps(nextProps) {
    const { match: { path } } = this.props;
    if (path.includes("edit")) {
      const { event: { loading } } = this.props;
      const { event: { loading: nextEventLoading } } = nextProps;
      if (loading === true && nextEventLoading === false) {
        this.hydrateStateWithData(nextProps);
      }
    }
  }
  hydrateStateWithData(props) {
    const { match: { path }, event: { event } } = props;
    this.setState(prevState => {
      return {
        ...prevState,
        form: updateFormForEvent(event, prevState.form)
      };
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
    const { form } = this.state;
    const userAlreadyInList = form.participantsList.find(
      item => item.id === user.id
    );
    if (!userAlreadyInList) {
      this.setState(prevState => {
        return {
          ...prevState,
          form: updateFormParticipants(user, form)
        };
      });
    }
  };

  handleParticipantDeleteClick = id => () => {
    this.setState(prevState => {
      return {
        ...prevState,
        form: updateFormParticipantsOnDelete(id, prevState.form)
      };
    });
  };

  handleRoomClick = room => () => {
    this.setState(prevState => {
      return {
        ...prevState,
        form: updateFormOnRoomClick(room, prevState.form)
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

  handleTimeInputChange = timeInputName => timeInputValue => {
    if (timeInputValue === null) {
      return;
    }
    this.setState(prevState => {
      const newForm = updateFormOnTimeInputChange(
        {
          name: timeInputName,
          value: timeInputValue
        },
        prevState.form,
        this.props
      );
      return {
        ...prevState,
        form: newForm
      };
    });
  };

  handleDateInputChange = dateInputValue => {
    this.setState(prevState => {
      return {
        ...prevState,
        form: updateFormOnDateInputChange(
          dateInputValue,
          prevState.form,
          this.props
        )
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
