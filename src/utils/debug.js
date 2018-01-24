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
const freeFirst = (roomA, roomB, date, db) => {
  const aFree = isRoomFree(roomA, date.start, date.end, db.events);
  const bFree = isRoomFree(roomB, date.start, date.end, db.events);
  if (aFree === bFree) return 0;
  if (aFree && !bFree) return -1;
  if (!aFree && bFree) return 1;
};

const persons1 = [
  makePerson("person-1", 1),
  makePerson("person-2", 1),
  makePerson("person-3", 1),
  makePerson("person-4", 1),
  makePerson("person-5", 1),
  makePerson("person-6", 1),
  makePerson("person-7", 1)
];

const rooms1 = [
  makeRoom(0, "room-0", 7, 1),
  makeRoom(1, "room-1", 5, 1),
  makeRoom(2, "room-2", 3, 1),
  makeRoom(3, "room-3", 2, 1)
];

const getRecommendation = (date, members, db) => {
  const iter = (swaps, date, members, events) => {
    const roomsOk = db.rooms
      .filter(room => isRoomSizeOk(members, room))
      .sort((a, b) => freeFirst(a, b, date, db))
      .sort(
        (a, b) => countTotalSteps(members, a) - countTotalSteps(members, b)
      );
    const freeRooms = roomsOk.filter(room =>
      isRoomFree(room, date.start, date.end, db.events)
    );
    if (roomsOk.lenght === 0) return null;
    if (freeRooms.length > 0) {
      return { freeRooms };
    } else {
      const smallerRooms = roomsOk;
      // .filter(
      //   room => room.capacity <= members.length
      // );
      for (i = 0; i <= smallerRooms.length - 1; i += 1) {
        const room = smallerRooms[i];
        const roomEventsForDate = db.events
          .filter(event => event.room == room.id)
          .filter(event => {
            const res =
              event.date.start >= date.start && event.date.end <= date.end;
            // console.log(res);
            return res;
          });
        let recommendations = [];
        try {
          const recommendations = roomEventsForDate.reduce((acc, event) => {
            const freeRooms = iter(swaps, event.date, event.members, db.events);
            if (freeRooms.freeRooms.length > 0) {
              return [
                ...acc,
                { event: event.id, room: freeRooms.freeRooms[0].id }
              ];
            } else if (freeRooms.swaps.length > 0) {
              return [...acc, ...freeRooms.swaps];
            } else {
              throw new Error("Deadend");
            }
          }, []);
          // swaps = swaps.concat(recommendations);
          return { freeRooms: [], swaps: recommendations };
        } catch (e) {
          console.log(e.message);
          return [];
        }
      }
      console.log(swaps);
      return { swaps };
    }
  };
  const result = iter([], date, members, db.events);
  console.log(result);
};

const date = makeEventDate([8, 0], [14, 0]);
const members = [persons[0], persons[3]];
const db = {
  events: [
    makeEvent(0, "e-1", Array(5), makeEventDate([8, 0], [12, 0]), 0),
    makeEvent(1, "e-2", Array(2), makeEventDate([12, 0], [14, 0]), 0),
    makeEvent(2, "e-3", Array(3), makeEventDate([8, 0], [11, 0]), 1),
    makeEvent(3, "e-4", Array(2), makeEventDate([11, 0], [13, 0]), 2)
  ],
  rooms: rooms1,
  persons: persons1
};

getRecommendation(date, persons1, db);
