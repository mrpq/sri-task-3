import moment from "moment";
import {
  getRecommendation,
  prepareRawEventsForGetRecommendation,
  prepareRawRoomsForGetRecommendation
} from "./getRecommendation";

export const createDefaultDates = (currentDate, timeStart, timeEnd) => {
  const dateStart = timeStart
    ? moment(parseInt(timeStart, 10))
    : currentDate.clone().minute(round5(currentDate.minute())); //currentDate.clone().hour(;
  const dateEnd = timeEnd
    ? moment(parseInt(timeEnd, 10))
    : dateStart.clone().add(15, "minutes");
  return { dateStart, dateEnd };
};

export const checkDateStartOk = (dateStart, dateEnd) => {
  return (
    dateStart.diff(dateEnd, "minutes") <= -15 &&
    dateStart <=
      dateStart
        .clone()
        .hour(23)
        .startOf("hour")
        .subtract(15, "minutes") &&
    dateStart >=
      dateStart
        .clone()
        .hour(8)
        .startOf("hour")
  );
};

export const checkDateEndOk = (dateStart, dateEnd) => {
  return (
    dateEnd.diff(dateStart, "minutes") >= 15 &&
    dateEnd >
      dateStart
        .clone()
        .hour(8)
        .minute(15)
        .startOf("minute") &&
    dateEnd <=
      dateStart
        .clone()
        .hour(23)
        .startOf("hour")
  );
};

export const checkFieldsErrors = form => {
  const titleOk = {
    fieldName: "title",
    ok: form.title.value.length > 0
  };
  const participantsOk = {
    fieldName: "participantsInput",
    ok: form.participantsList.length > 0
  };
  const roomOk = {
    fieldName: "room",
    ok: form.room.value
  };
  const dateStart = form.dateStart.value;
  const dateEnd = form.dateEnd.value;
  const dateStartOk = {
    fieldName: "dateStart",
    ok: checkDateStartOk(dateStart, dateEnd)
  };
  const dateEndOk = {
    fieldName: "dateEnd",
    ok: checkDateEndOk(dateStart, dateEnd)
  };
  const fields = [titleOk, participantsOk, roomOk, dateStartOk, dateEndOk];
  return fields;
};

export const checkSameRoomRecommendationExistForNewDate = (
  newDate,
  fieldName,
  form,
  props
) => {
  newDate = moment(newDate);
  if (!form.room.value) return false;
  let {
    match: { path, params: { eventId } },
    events: { loading: eventsLoading, events },
    rooms: { loading: roomsLoading, rooms }
  } = props;
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
    start: form.dateStart.value,
    end: form.dateEnd.value
  };
  if (fieldName && fieldName === "dateStart") {
    // this part is executing only when time input changed
    // needed to check if new event time fits free slot
    date.start = newDate;
  } else if (fieldName && fieldName === "dateEnd") {
    date.end = newDate;
  } else {
    date.start
      .year(newDate.year())
      .month(newDate.month())
      .date(newDate.date());
    date.end
      .year(newDate.year())
      .month(newDate.month())
      .date(newDate.date());
  }
  const recommendations = getRecommendation(date, form.participantsList, db);
  const sameRoomRecommendation = recommendations
    .filter(rec => !rec.asap)
    .find(rec => {
      const result =
        parseInt(form.room.value.id, 10) === parseInt(rec.room, 10);
      return result;
    });
  if (sameRoomRecommendation) return sameRoomRecommendation;
};

const round5 = x => {
  return Math.ceil(x / 5) * 5;
};
