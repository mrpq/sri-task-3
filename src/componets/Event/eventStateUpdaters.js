export const setFormFieldsErrors = (fields, form) => {
  const errorFields = fields.reduce((acc, fieldName) => {
    return {
      ...acc,
      [fieldName]: { ...form[fieldName], errors: true }
    };
  }, {});
  return { ...form, ...errorFields };
};
