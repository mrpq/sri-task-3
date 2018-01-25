import moment from "moment";
// const moment = require("moment");

class Recommendation {
  constructor(eventDate, roomId, swap = []) {
    this.date = eventDate;
    this.room = `${roomId}`;
    this.swap = swap;
  }
}

export const getRecommendation = (date, members, db) => {
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
          event => event.room == filteredRooms[i].id
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

const freeFirst = (date, db) => (roomA, roomB) => {
  const aFree = isRoomFree(date, db.events)(roomA);
  const bFree = isRoomFree(date, db.events)(roomB);
  if (aFree === bFree) return 0;
  if (aFree && !bFree) return -1;
  if (!aFree && bFree) return 1;
};

export const findClosestAvailableTime = (date, room, allEvents) => {
  const roomEventsSortedByTime = allEvents
    .filter(event => event.room == room.id) // work only with events for exact room
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
export const isRoomFree = (date, eventsList) => room => {
  const { start, end } = date;
  const dayStart = moment()
    .hour(8)
    .startOf("hour");
  const dayEnd = moment()
    .hour(23)
    .startOf("hour");
  const isFree = eventsList
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

export const isRoomSizeOk = persons => room => {
  return persons.length <= room.capacity;
};

const sortByTotalSteps = members => (roomA, roomB) => {
  return (
    countTotalSteps(members, roomA.floor) -
    countTotalSteps(members, roomB.floor)
  );
};

export const countTotalSteps = (members, roomFloor) => {
  const result = members.reduce((acc, member) => {
    return acc + Math.abs(member.floor - roomFloor);
  }, 0);
  return result;
};
// export default getRecommendation;
