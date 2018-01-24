// import moment from "moment";
const moment = require("moment");
const makeTime = (hours, minutes) => {
  return moment()
    .hours(hours)
    .minutes(minutes)
    .startOf("minute");
};
const makePerson = (login, floor) => {
  return { login, floor };
};
const makeRoom = (id, title, capacity, floor) => {
  return { id, title, capacity, floor };
};
const makeEventDate = (start, end) => {
  return {
    start: makeTime(...start),
    end: makeTime(...end)
  };
};
const makeEvent = (id, titile, members, date, roomId) => {
  return { id, titile, members, date, room: roomId };
};
const makeRoomsSwap = (eventId, roomId) => {
  return { event: eventId, room: roomId };
};
const makeRecommendation = (date, roomId, swap) => {
  return { date, room: roomId, swap };
};
const persons = [
  makePerson("person-1", 1),
  makePerson("person-2", 1),
  makePerson("person-3", 5),
  makePerson("person-4", 6)
];

const rooms = [
  makeRoom(0, "room-1", 2, 3),
  makeRoom(1, "room-1", 2, 3),
  makeRoom(2, "room-2", 4, 4),
  makeRoom(3, "room-2", 4, 5)
];
/**
 * @param {EventDate} date Дата планируемой встречи.
 * @param {Person[]} members Участники планируемой встречи.
 * @param {Object} db
 * @param {Event[]} db.events Список все встреч.
 * @param {Room[]} db.rooms Список всех переговорок.
 * @param {Person[]} db.persons Список всех сотрудников.
 * @returns {Recommendation[]}
 */
class Recommendation {
  constructor(eventDate, roomId, roomsSwap = []) {
    this.date = eventDate;
    this.room = `${roomId}`;
    this.roomsSwap = [];
  }
}
const getRecommendation = (date, members, db) => {
  const roomsOk = db.rooms
    .filter(room => isRoomSizeOk(members, room))
    .sort((a, b) => countTotalSteps(members, a) - countTotalSteps(members, b))
    .sort((a, b) => {
      const aFree = isRoomFree(a, date.start, date.end, db.events);
      const bFree = isRoomFree(b, date.start, date.end, db.events);
      console.log(a.id, " ", aFree);
      console.log(b.id, " ", bFree);
      if (aFree === bFree) return 0;
      if (aFree && !bFree) return -1;
      if (!aFree && bFree) return 1;
    });
  console.log(roomsOk);
  const recommendations = roomsOk.map(
    room => new Recommendation(date, room.id, [])
  );
  return recommendations;
};

/**
 *
 *
 * @param {Number} room
 * @param {Date} start
 * @param {Date} end
 * @param {} events
 */
const isRoomFree = (room, start, end, events) => {
  const dayStart = moment()
    .hour(8)
    .startOf("hour");
  const dayEnd = moment()
    .hour(23)
    .startOf("hour");
  const isFree = events
    .filter(event => parseInt(event.room) === parseInt(room.id))
    .every(event => {
      const res =
        start >= dayStart &&
        end <= dayEnd &&
        (start >= event.date.end ||
          (start <= event.date.start && end <= event.date.start));
      return res;
    });
  return isFree;
};

const isRoomSizeOk = (persons, room) => {
  return persons.length <= room.capacity;
};

const countTotalSteps = (members, room) => {
  const result = members.reduce((acc, member) => {
    return acc + Math.abs(member.floor - room.floor);
  }, 0);
  return result;
};

const date = makeEventDate([8, 0], [9, 0]);
const members = [persons[0], persons[3]];
const db = {
  events: [
    makeEvent(1, "e-1", Array(2), makeEventDate([8, 0], [10, 0]), 1),
    makeEvent(2, "e-1", Array(2), makeEventDate([8, 0], [10, 0]), 2),
    makeEvent(3, "e-1", Array(2), makeEventDate([10, 0], [11, 0]), 3),
    makeEvent(3, "e-1", Array(2), makeEventDate([8, 0], [11, 0]), 0)
  ],
  rooms: rooms,
  persons: persons
};
getRecommendation(date, members, db);
