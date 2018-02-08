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
