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
const makeEvent = (id, title, members, date, roomId) => {
  return { id, title, members, date, room: roomId };
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
    this.roomsSwap = roomsSwap;
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
  makeRoom(3, "room-3", 2, 1),
  makeRoom(4, "room-4", 3, 1),
  makeRoom(5, "room-6", 7, 1)
];

const getRecommendation = (date, members, db) => {
  const getSwapsForEvent = (event, room, roomsList, swaps) => {
    console.log(event.title);
    const roomsOk = roomsList
      .filter(room => isRoomSizeOk(event.members, room))
      .sort((a, b) => freeFirst(a, b, event.date, db))
      .sort(
        (a, b) =>
          countTotalSteps(event.members, a) - countTotalSteps(event.members, b)
      );
    if (roomsOk.length === 0) {
      return { result: false, swaps };
    }
    const freeRooms = roomsOk.filter(room =>
      isRoomFree(room, event.date.start, event.date.end, db.events)
    );
    if (freeRooms.length > 0) {
      return {
        result: true,
        swaps: [...swaps, { event: event.id, room: freeRooms[0].id }]
      };
    } else {
      const filteredRooms = roomsOk.filter(r => r.id !== room.id);
      for (i = 0; i <= filteredRooms.length - 1; i++) {
        const roomEventsForDate = db.events.filter(
          event => event.room == filteredRooms[i].id
        );
        const res = { result: true, swaps: [] };
        for (j = 0; j <= roomEventsForDate.length - 1; j++) {
          const result = getSwapsForEvent(
            roomEventsForDate[j],
            filteredRooms[i],
            db.rooms
              .filter(room => room.capacity <= filteredRooms[i].capacity)
              .filter(room => room.id !== filteredRooms[i].id),
            swaps
          );
          if (result.result) {
            // return {
            //   result: true,
            //   swaps: [
            //     ...result.swaps,
            //     { event: event.id, room: filteredRooms[i].id }
            //   ]
            // };
            res.result = true;
            res.swaps = [
              ...res.swaps,
              ...result.swaps,
              { event: event.id, room: filteredRooms[i].id }
            ];
            // break;
          } else {
            return { result: false };
          }
        }
        if (res.result) return res;
      }
    }
  };
  const roomsOk = db.rooms
    .filter(room => isRoomSizeOk(members, room))
    .sort((a, b) => freeFirst(a, b, date, db))
    .sort((a, b) => countTotalSteps(members, a) - countTotalSteps(members, b));

  const freeRooms = roomsOk.filter(room =>
    isRoomFree(room, date.start, date.end, db.events)
  );
  if (freeRooms.length > 0) {
    return freeRooms.reduce((acc, room) => {
      const { id: roomId } = room;
      return [...acc, new Recommendation(date, roomId)];
    });
  }

  const recommendationsWithSwaps = roomsOk.reduce((acc, room) => {
    const roomEventsForDate = db.events.filter(event => event.room == room.id);
    const filteredRooms = db.rooms.filter(r => r.id !== room.id);
    // console.log(filteredRooms.length);
    const res = [];
    for (i = 0; i <= roomEventsForDate.length - 1; i++) {
      const swaps = getSwapsForEvent(
        roomEventsForDate[i],
        room,
        filteredRooms,
        []
      );
      if (swaps.result === true) {
        res.push(...swaps.swaps);
      } else {
        res = [];
        break;
      }
    }
    if (res.length > 0) {
      return [...acc, new Recommendation(date, room.id, res)];
    } else {
      return acc;
    }
  }, []);
  if (recommendationsWithSwaps.length > 0) {
    return recommendationsWithSwaps;
  }
};

const date = makeEventDate([8, 0], [14, 0]);
const members = [persons[0], persons[3]];
const db = {
  events: [
    // makeEvent(0, "e-1", Array(5), makeEventDate([8, 0], [12, 0]), 0),
    // makeEvent(1, "e-2", Array(2), makeEventDate([12, 0], [14, 0]), 0),
    // makeEvent(2, "e-3", Array(3), makeEventDate([8, 0], [11, 0]), 1),
    // makeEvent(3, "e-4", Array(2), makeEventDate([11, 0], [13, 0]), 2)
    makeEvent(0, "e-1", Array(5), makeEventDate([8, 0], [12, 0]), 0),
    makeEvent(1, "e-2", Array(2), makeEventDate([12, 0], [14, 0]), 0),
    makeEvent(2, "e-3", Array(3), makeEventDate([8, 0], [11, 0]), 1),
    makeEvent(3, "e-4", Array(2), makeEventDate([11, 0], [13, 0]), 2),
    makeEvent(4, "e-5", Array(2), makeEventDate([11, 0], [13, 0]), 2),
    makeEvent(5, "e-6", Array(2), makeEventDate([11, 0], [13, 0]), 5)
  ],
  rooms: rooms1,
  persons: persons1
};

const res = getRecommendation(date, persons1, db);
getRecommendation(date, persons1, db);
