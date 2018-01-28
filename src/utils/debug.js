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

class Recommendation {
  constructor(eventDate, roomId, roomsSwap = []) {
    this.date = eventDate;
    this.room = `${roomId}`;
    this.roomsSwap = roomsSwap;
  }
}

const freeFirst = (date, db) => (roomA, roomB) => {
  const aFree = isRoomFree(date, db.events)(roomA);
  const bFree = isRoomFree(date, db.events)(roomB);
  if (aFree === bFree) return 0;
  if (aFree && !bFree) return -1;
  if (!aFree && bFree) return 1;
};

const findClosestAvailableTime = (date, room, allEvents) => {
  const roomEventsSortedByTime = allEvents
    .filter(event => parseInt(event.room, 10) === parseInt(room.id, 10)) // work only with events for exact room
    .filter(event => event.date.end > date.start) // filter events in past
    .sort((eventA, eventB) => eventA.date.end - eventB.date.start); //sort events by time
  let closestAvailableTime = null;
  const duration = date.end - date.start;
  for (let i = 0; i <= roomEventsSortedByTime.length - 1; i += 1) {
    if (closestAvailableTime !== null) break;
    const currEvent = roomEventsSortedByTime[i];
    const currEventEnd = currEvent.date.end;
    const nextEvent = roomEventsSortedByTime[i + 1] || null;
    const nextEventStart = nextEvent ? nextEvent.date.start : Infinity;
    const timeGapBetweenEvents = nextEventStart - currEventEnd;
    if (duration <= timeGapBetweenEvents) {
      closestAvailableTime = moment(currEventEnd);
    }
  }
  return closestAvailableTime;
};
/**
 *
 *
 * @param {Number} room
 * @param {Date} start
 * @param {Date} end
 * @param {Array} eventsList
 */
const isRoomFree = (date, eventsList) => room => {
  const { start, end } = date;
  const dayStart = moment(start)
    .hour(8)
    .startOf("hour");
  const dayEnd = moment(start)
    .hour(23)
    .startOf("hour");
  const isFree = eventsList
    .filter(event => parseInt(event.room, 10) === parseInt(room.id, 10))
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

const isRoomSizeOk = persons => room => {
  return persons.length <= room.capacity;
};

const sortByTotalSteps = members => (roomA, roomB) => {
  return (
    countTotalSteps(members, roomA.floor) -
    countTotalSteps(members, roomB.floor)
  );
};

const countTotalSteps = (members, roomFloor) => {
  const result = members.reduce((acc, member) => {
    return acc + Math.abs(member.homeFloor - roomFloor);
    // return acc + Math.abs(member.floor - roomFloor);
  }, 0);
  return result;
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
  makeRoom(0, "0-Rikov", 7, 1),
  makeRoom(1, "1-Tamozh", 5, 1),
  makeRoom(2, "2-Micro", 3, 1),
  makeRoom(3, "3-Gazor", 2, 1)
  // makeRoom(4, "room-4", 3, 1),
  // makeRoom(5, "room-6", 7, 1)
];

const getRecommendation = (date, members, db) => {
  const getSwapsForEvent = (event, room, roomsList, swaps) => {
    const roomsOk = roomsList
      .filter(isRoomSizeOk(event.members))
      .sort(freeFirst(event.date, db))
      .sort(sortByTotalSteps(event.members));
    if (roomsOk.length === 0) {
      return { result: false, swaps };
    }
    const freeRooms = roomsOk.filter(isRoomFree(event.date, db.events));
    if (freeRooms.length > 0) {
      return {
        result: true,
        swaps: [...swaps, { event: event.id, room: freeRooms[0].id }]
      };
    } else {
      const filteredRooms = roomsOk.filter(r => r.id !== room.id);
      for (let i = 0; i <= filteredRooms.length - 1; i++) {
        const roomEventsForDate = db.events.filter(
          e =>
            parseInt(e.room, 10) === parseInt(filteredRooms[i].id, 10) &&
            ((e.date.end > event.date.start && e.date.start < event.date.end) ||
              (e.date.start < event.date.end && e.date.end > event.date.start))
          //   e.date.end > event.date.start) ||
          // e.date.start < event.date.end
        );
        const res = { result: true, swaps: [] };
        for (let j = 0; j <= roomEventsForDate.length - 1; j++) {
          const result = getSwapsForEvent(
            roomEventsForDate[j],
            filteredRooms[i],
            db.rooms
              .filter(room => room.capacity <= filteredRooms[i].capacity)
              .filter(room => room.id !== filteredRooms[i].id),
            swaps
          );
          if (result.result) {
            res.result = true;
            res.swaps = [
              ...res.swaps,
              ...result.swaps,
              { event: event.id, room: filteredRooms[i].id }
            ];
          } else {
            return { result: false };
          }
        }
        if (res.result) return res;
      }
    }
  };
  const roomsOk = db.rooms.filter(isRoomSizeOk(members));

  // try find recommendations with rooms, return if found
  const freeRooms = roomsOk
    .filter(isRoomFree(date, db.events))
    .sort(sortByTotalSteps(members));
  if (freeRooms.length > 0) {
    return freeRooms.reduce((acc, room) => {
      const { id: roomId } = room;
      return [...acc, new Recommendation(date, roomId)];
    }, []);
  }

  // try find recommendations with swaps, return if found
  const recommendationsWithSwaps = roomsOk.reduce((acc, room) => {
    const roomEventsForDate = db.events.filter(event => {
      return (
        event.room === room.id &&
        ((event.date.end > date.start && event.date.start < date.end) ||
          (event.date.start < date.end && event.date.end > date.start))
      );
    });
    const filteredRooms = db.rooms.filter(
      r => parseInt(r.id, 10) !== parseInt(room.id, 10)
    );
    const res = [];
    for (let i = 0; i <= roomEventsForDate.length - 1; i++) {
      const swaps = getSwapsForEvent(
        roomEventsForDate[i],
        room,
        filteredRooms,
        []
      );
      if (swaps.result === true) {
        res.push(...swaps.swaps);
      } else {
        res.length = 0;
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
    return recommendationsWithSwaps.sort(
      (a, b) => a.swap.length - b.swap.length
    ); // recommendations with least amounts of swaps first
  }

  // make recommendations with first available rooms

  const firstAvailable = roomsOk
    .reduce((acc, room) => {
      const closestAvailableTime = findClosestAvailableTime(
        date,
        room,
        db.events
      );
      return [
        ...acc,
        new Recommendation(
          {
            start: closestAvailableTime,
            end: moment(closestAvailableTime + (date.end - date.start))
          },
          room.id
        )
      ];
    }, [])
    .sort(
      (recommendationA, recommendationB) =>
        recommendationA.date.start - recommendationB.date.start
    );
  return firstAvailable;
};

const date = makeEventDate([8, 0], [15, 0]);
const db = {
  events: [
    makeEvent(0, "e-0", Array(5), makeEventDate([8, 0], [12, 0]), 0),
    makeEvent(1, "e-1", Array(2), makeEventDate([12, 0], [14, 0]), 0),
    makeEvent(2, "e-2", Array(3), makeEventDate([8, 0], [11, 0]), 1),
    makeEvent(3, "e-3", Array(2), makeEventDate([11, 0], [13, 0]), 2),
    makeEvent(4, "e-long-1", Array(6), makeEventDate([14, 0], [23, 0]), 0),
    makeEvent(5, "e-long-2", Array(4), makeEventDate([14, 0], [23, 0]), 1),
    makeEvent(6, "e-long-3", Array(3), makeEventDate([14, 0], [23, 0]), 2),
    makeEvent(7, "e-long-4", Array(2), makeEventDate([14, 0], [23, 0]), 3)
    // makeEvent(0, "e-1", Array(5), makeEventDate([8, 0], [12, 0]), 0),
    // makeEvent(1, "e-2", Array(2), makeEventDate([12, 0], [14, 0]), 0),
    // makeEvent(2, "e-3", Array(3), makeEventDate([8, 0], [11, 0]), 1),
    // makeEvent(3, "e-4", Array(2), makeEventDate([11, 0], [13, 0]), 2)
    // makeEvent(4, "e-5", Array(2), makeEventDate([11, 0], [13, 0]), 2),
    // makeEvent(5, "e-6", Array(2), makeEventDate([11, 0], [13, 0]), 5)
  ],
  rooms: rooms1,
  persons: persons1
};

const res = getRecommendation(date, persons1, db);
