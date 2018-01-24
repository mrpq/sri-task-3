// import moment from "moment";
const moment = require("moment");
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
const getRecommendationForSwap = (date, members, db) => {};

export const getRecommendation = (date, members, db) => {
  const iter = (swaps, events) => {
    const roomsOk = db.rooms
      .filter(room => isRoomSizeOk(members, room))
      .sort((a, b) => freeFirst(a, b, date, db))
      .sort(
        (a, b) => countTotalSteps(members, a) - countTotalSteps(members, b)
      );
    const freeRooms = roomsOk.filter(room =>
      isRoomFree(room, date.start, date.end, db.events)
    );
    if (freeRooms) {
      const recommendations = freeRooms.map(
        room => new Recommendation(date, room.id, swaps)
      );
      return recommendations;
    } else {
      for (i = 0; i <= roomsOk.length; i += 1) {
        const room = roomsOk[i];
        const roomEventsForDate = db.events
          .filter(event => event.room == room.id)
          .filter(
            event =>
              event.date.start >= date.start && event.date.end <= date.end
          );
        const recommendations = iter(swaps);
      }
    }
  };
  return iter([], db.events);
};
const freeFirst = (roomA, roomB, date, db) => {
  const aFree = isRoomFree(roomA, date.start, date.end, db.events);
  const bFree = isRoomFree(roomB, date.start, date.end, db.events);
  if (aFree === bFree) return 0;
  if (aFree && !bFree) return -1;
  if (!aFree && bFree) return 1;
};

/**
 *
 *
 * @param {Number} room
 * @param {Date} start
 * @param {Date} end
 * @param {} events
 */
export const isRoomFree = (room, start, end, events) => {
  const dayStart = moment()
    .hour(8)
    .startOf("hour");
  const dayEnd = moment()
    .hour(23)
    .startOf("hour");
  const isFree = events
    .filter(event => parseInt(event.room) === parseInt(room.id))
    .every(event => {
      // console.log(start >= dayStart);
      const res =
        start >= dayStart &&
        end <= dayEnd &&
        (start >= event.date.end ||
          (start <= event.date.start && end <= event.date.start));
      return res;
    });
  return isFree;
};

export const isRoomSizeOk = (persons, room) => {
  return persons.length <= room.capacity;
};

export const countTotalSteps = (members, room) => {
  const result = members.reduce((acc, member) => {
    return acc + Math.abs(member.floor - room.floor);
  }, 0);
  return result;
};
export default getRecommendation;
