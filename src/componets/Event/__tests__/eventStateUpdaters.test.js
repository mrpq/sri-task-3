import React from "react";
import { setFormFieldsErrors } from "../eventStateUpdaters";

describe("setFormFieldsErrors()", () => {
  const initStateForm = ({
    title,
    date,
    dateStart,
    dateEnd,
    participantsInput,
    room
  }) => {
    return {
      title: { value: title, errors: null },
      date: { value: date, errors: null },
      dateStart: { value: dateStart, errors: null },
      dateEnd: { value: dateEnd, errors: null },
      participantsInput: { value: "", errors: null },
      room: { value: room, errors: null }
    };
  };
  it("returns result of proper type", () => {
    const form = initStateForm({});
    const fieldsWithErrors = ["title"];
    const actual = setFormFieldsErrors(fieldsWithErrors)(form);
    const expected = "object";
    expect(typeof actual).toBe(expected);
  });

  it("toggles errors on proper fields", () => {
    const form = initStateForm({});
    const fieldsWithErrors = ["title"];
    const updatedForm = setFormFieldsErrors(fieldsWithErrors)(form);
    const actual = updatedForm.title.errors;
    const expected = true;
    expect(actual).toBe(expected);
  });

  it("does not toggle errors on improper fields", () => {
    const form = initStateForm({});
    const fieldsWithErrors = ["title"];
    const updatedForm = setFormFieldsErrors(fieldsWithErrors)(form);
    const expected = true;
    expect(updatedForm.date.errors).not.toBe(expected);
    expect(updatedForm.dateStart.errors).not.toBe(expected);
    expect(updatedForm.dateEnd.errors).not.toBe(expected);
    expect(updatedForm.participantsInput.errors).not.toBe(expected);
    expect(updatedForm.room.errors).not.toBe(expected);
  });
});
