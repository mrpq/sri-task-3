// import moment from "moment";
const moment = require("moment");

class Recommendation {
  constructor(eventDate, roomId, swap = []) {
    this.date = eventDate;
    this.room = `${roomId}`;
    this.swap = swap;
  }
}

export const getRecommendation = (date, members, db) => {
  const getSwapsForEvent = (event, room, roomsList, swaps) => {
    // console.log(event.title);
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
      for (let i = 0; i <= filteredRooms.length - 1; i++) {
        const roomEventsForDate = db.events.filter(
          event => event.room == filteredRooms[i].id
        );
        const res = { result: true, swaps: [] };
        // console.log(roomEventsForDate.length);
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
            // console.log("ok! event ", roomEventsForDate[j], " ", res);
          } else {
            return { result: false };
            // console.log("fail! event ", roomEventsForDate[j], " ", res);
          }
        }
        if (res.result) return res;
      }
    }
  };
  const roomsOk = db.rooms.filter(room => isRoomSizeOk(members, room));

  // .sort((a, b) => freeFirst(a, b, date, db))

  const freeRooms = roomsOk
    .filter(room => isRoomFree(room, date.start, date.end, db.events))
    .sort((a, b) => countTotalSteps(members, a) - countTotalSteps(members, b));
  if (freeRooms.length > 0) {
    return freeRooms.reduce((acc, room) => {
      const { id: roomId } = room;
      return [...acc, new Recommendation(date, roomId)];
    }, []);
  }

  const recommendationsWithSwaps = roomsOk.reduce((acc, room) => {
    // console.log("tik, ", acc);
    const roomEventsForDate = db.events.filter(event => event.room == room.id);
    const filteredRooms = db.rooms.filter(r => r.id !== room.id);
    // console.log(filteredRooms.length);
    const res = [];
    for (let i = 0; i <= roomEventsForDate.length - 1; i++) {
      // console.log(roomEventsForDate[i]);
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
  // console.log(recommendationsWithSwaps[0]);
  // console.log(recommendationsWithSwaps[0]);
  if (recommendationsWithSwaps.length > 0) {
    return recommendationsWithSwaps.sort(
      (a, b) => a.swap.length - b.swap.length
    ); // recommendations with least amounts of swaps first
  }
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
// export default getRecommendation;
