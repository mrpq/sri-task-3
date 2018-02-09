import moment from "moment";

export const setFormFieldsErrors = (fields, form) => {
  const errorFields = fields.reduce((acc, fieldName) => {
    return {
      ...acc,
      [fieldName]: { ...form[fieldName], errors: true }
    };
  }, {});
  return { ...form, ...errorFields };
};

export const updateFormForEvent = (event, form) => {
  return {
    ...form,
    title: { value: event.title },
    date: { value: moment(event.dateStart) },
    dateStart: { value: moment(event.dateStart) },
    dateEnd: { value: moment(event.dateEnd) },
    participantsList: event.users,
    room: { value: event.room }
  };
};

export const updateFormParticipants = (user, form) => {
  const {
    participantsList,
    addedParticipantsIdsList,
    deletedParticipantsIdsList,
    room
  } = form;
  form;
  const newParticipantsList = participantsList.concat(user);
  const newAddedParticipantsIdsList = addedParticipantsIdsList.concat(user.id);
  const newDeletedParticipantsIdsList = deletedParticipantsIdsList.filter(
    id => id !== user.id
  );
  let newRoom = room;
  if (room && room.value.capacity < newParticipantsList.length) {
    newRoom = { ...room, value: null };
  }
  return {
    ...form,
    participantsList: newParticipantsList,
    addedParticipantsIdsList: newAddedParticipantsIdsList,
    deletedParticipantsIdsList: newDeletedParticipantsIdsList,
    room: newRoom
  };
};

export const updateFormParticipantsOnDelete = (userId, form) => {
  const {
    addedParticipantsIdsList,
    participantsList,
    deletedParticipantsIdsList
  } = form;
  const newParticipantsList = participantsList.filter(
    user => userId !== user.id
  );
  const newAddedParticipantsIdsList = addedParticipantsIdsList.filter(
    id => id !== userId
  );
  const newDeletedParticipantsIdsList = deletedParticipantsIdsList.concat(
    userId
  );
  return {
    ...form,
    participantsList: newParticipantsList,
    addedParticipantsIdsList: newAddedParticipantsIdsList,
    deletedParticipantsIdsList: newDeletedParticipantsIdsList
  };
};
