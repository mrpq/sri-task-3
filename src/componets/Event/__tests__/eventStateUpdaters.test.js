import React from "react";
import {
  setFormFieldsErrors,
  updateFormParticipants
} from "../eventStateUpdaters";

const initStateForm = ({
  title = { value: "", errors: null },
  date = { value: "", errors: null },
  dateStart = { value: "", errors: null },
  dateEnd = { value: "", errors: null },
  participantsList = [],
  participantsInput = { value: "", errors: null },
  room = { value: "", errors: null },
  addedParticipantsIdsList = [],
  deletedParticipantsIdsList = []
}) => {
  return {
    title,
    date,
    dateStart,
    dateEnd,
    participantsList,
    participantsInput,
    room,
    addedParticipantsIdsList,
    deletedParticipantsIdsList
  };
};

describe("setFormFieldsErrors()", () => {
  it("returns result of proper type", () => {
    const form = initStateForm({});
    const fieldsWithErrors = ["title"];
    const actual = setFormFieldsErrors(fieldsWithErrors, form);
    const expected = "object";
    expect(typeof actual).toBe(expected);
  });

  it("toggles errors on proper fields", () => {
    const form = initStateForm({});
    const fieldsWithErrors = ["title"];
    const updatedForm = setFormFieldsErrors(fieldsWithErrors, form);
    const actual = updatedForm.title.errors;
    const expected = true;
    expect(actual).toBe(expected);
  });

  it("does not toggle errors on improper fields", () => {
    const form = initStateForm({});
    const fieldsWithErrors = ["title"];
    const updatedForm = setFormFieldsErrors(fieldsWithErrors, form);
    const expected = true;
    expect(updatedForm.date.errors).not.toBe(expected);
    expect(updatedForm.dateStart.errors).not.toBe(expected);
    expect(updatedForm.dateEnd.errors).not.toBe(expected);
    expect(updatedForm.participantsInput.errors).not.toBe(expected);
    expect(updatedForm.room.errors).not.toBe(expected);
  });
});

describe("updateFormParticipants()", () => {
  it("user added to form.participantsList", () => {
    const form = initStateForm({
      participantsList: [{ id: "1" }, { id: "2" }]
    });
    const updatedForm = updateFormParticipants({ id: "3" }, form);
    const actual = updatedForm.participantsList;
    expect(actual).toHaveLength(3);
    expect(actual).toContainEqual({ id: "3" });
  });

  it("user id is added to form.addedParticipantsIdsList", () => {
    const form = initStateForm({
      participantsList: [{ id: "1" }, { id: "2" }],
      addedParticipantsIdsList: []
    });
    const updatedForm = updateFormParticipants({ id: "3" }, form);
    const actual = updatedForm.addedParticipantsIdsList;
    expect(actual).toContain("3");
  });

  it("user id is deleted to form.deletedParticipantsIdsList", () => {
    const form = initStateForm({
      participantsList: [{ id: "1" }, { id: "2" }],
      deletedParticipantsIdsList: ["3"]
    });
    const updatedForm = updateFormParticipants({ id: "3" }, form);
    const actual = updatedForm.deletedParticipantsIdsList;
    expect(actual).not.toContain("3");
  });

  it("form.room reset if does not fit users", () => {
    const form = initStateForm({
      participantsList: [{ id: "1" }, { id: "2" }],
      addedParticipantsIdsList: [],
      deletedParticipantsIdsList: [],
      room: { value: { capacity: 2 } }
    });
    const updatedForm = updateFormParticipants({ id: "3" }, form);
    console.log(updatedForm);
    const actual = updatedForm.room;
    expect(actual.value).toBeNull();
  });
});
