import moment from "moment";
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
export const getRecommendation = (date, members, db) => {
  const roomsOk = db.rooms
    .filter(room => isRoomSizeOk(members, room))
    .sort((a, b) => countTotalSteps(members, a) - countTotalSteps(members, b));
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
export const isRoomFree = (room, start, end, events) => {
  const dayStart = moment()
    .hour(8)
    .startOf("hour");
  const dayEnd = moment()
    .hour(23)
    .startOf("hour");
  const isFree = events.every(event => {
    const res =
      start > dayStart &&
      end < dayEnd &&
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
  console.log(result);
  return result;
};
export default getRecommendation;
