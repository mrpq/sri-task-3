import {
  isRoomFree,
  isRoomSizeOk,
  countTotalSteps,
  getRecommendation
} from "../getRecommendation";
import moment from "moment";
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
  makeRoom(0, "room-0", 2, 3),
  makeRoom(1, "room-1", 2, 3),
  makeRoom(2, "room-2", 4, 4),
  makeRoom(3, "room-3", 4, 5)
];
////
test("Test countTotalSteps 1", () => {
  const members = [persons[0], persons[1]];
  const result = countTotalSteps(members, rooms[0]);
  expect(result).toBe(4);
});
test("Test countTotalSteps 2", () => {
  const members = [persons[0], persons[1]];
  const result = countTotalSteps(members, rooms[2]);
  expect(result).toBe(6);
});
test("Test countTotalSteps 4", () => {
  const members = [persons[0], persons[3]];
  const result = countTotalSteps(members, rooms[3]);
  expect(result).toBe(5);
});
////
test("Test isRoomFree 1", () => {
  const events = [
    makeEvent(1, "e-1", [], makeEventDate([8, 0], [9, 0]), 1),
    makeEvent(2, "e-2", [], makeEventDate([10, 0], [11, 0]), 1)
  ];
  const result = isRoomFree(
    rooms[1],
    makeTime(...[9, 1]),
    makeTime(...[9, 59]),
    events
  );
  expect(result).toBe(true);
});
test("Test isRoomFree 2", () => {
  const events = [
    makeEvent(1, "e-1", [], makeEventDate([8, 0], [9, 0]), 1),
    makeEvent(2, "e-2", [], makeEventDate([10, 0], [11, 0]), 1)
  ];
  const result = isRoomFree(
    rooms[1],
    makeTime(...[8, 59]),
    makeTime(...[9, 59]),
    events
  );
  expect(result).toBe(false);
});
test("Test isRoomFree 3", () => {
  const events = [
    makeEvent(1, "e-1", [], makeEventDate([8, 0], [9, 0]), 1),
    makeEvent(2, "e-2", [], makeEventDate([10, 0], [11, 0]), 1)
  ];
  const result = isRoomFree(
    rooms[1],
    makeTime(...[9, 0]),
    makeTime(...[10, 0]),
    events
  );
  expect(result).toBe(true);
});
test("Test isRoomFree 4", () => {
  const events = [
    makeEvent(1, "e-1", [], makeEventDate([8, 0], [9, 0]), 1),
    makeEvent(2, "e-2", [], makeEventDate([10, 0], [11, 0]), 1),
    makeEvent(2, "e-2", [], makeEventDate([9, 30], [9, 40]), 1)
  ];
  const result = isRoomFree(
    rooms[1],
    makeTime(...[9, 0]),
    makeTime(...[10, 0]),
    events
  );
  expect(result).toBe(false);
});
test("Test isRoomFree 5", () => {
  const events = [
    makeEvent(1, "e-1", [], makeEventDate([9, 0], [10, 0]), 1),
    makeEvent(2, "e-2", [], makeEventDate([10, 0], [22, 0]), 1)
  ];
  const result = isRoomFree(
    rooms[1],
    makeTime(...[7, 59]),
    makeTime(...[9, 0]),
    events
  );
  expect(result).toBe(false);
});
test("Test isRoomFree 6 - empty events", () => {
  const events = [];
  const result = isRoomFree(
    rooms[1],
    makeTime(...[8, 59]),
    makeTime(...[10, 0]),
    events
  );
  expect(result).toBe(true);
});

///////
test("Test isRoomSizeOk 1", () => {
  const persons = Array(1);
  const result = isRoomSizeOk(persons, rooms[1]);
  expect(result).toBe(true);
});
test("Test isRoomSizeOk 2 - not ok if to many persons", () => {
  const persons = Array(5);
  const result = isRoomSizeOk(persons, rooms[1]);
  expect(result).not.toBe(true);
});
test("Test isRoomSizeOk 3 - edge case", () => {
  const persons = Array(2);
  const result = isRoomSizeOk(persons, rooms[1]);
  expect(result).toBe(true);
});
///////////

test("Test getRecommendation 1 - only enougth space rooms #1", () => {
  const date = makeEventDate([8, 0], [9, 0]);
  const members = [persons[1], persons[2]];
  const db = {
    events: [makeEvent(1, "e-1", Array(2), makeEventDate([9, 0], [10, 0]), 0)],
    rooms: [rooms[0]],
    persons: persons
  };
  expect(getRecommendation(date, members, db).length).toBe(1);
});
test("Test getRecommendation 1 - only enougth space rooms #2", () => {
  const date = makeEventDate([8, 0], [9, 0]);
  const members = [persons[1], persons[2], persons[3]];
  const db = {
    events: [makeEvent(1, "e-1", Array(2), makeEventDate([9, 0], [10, 0]), 0)],
    rooms: [rooms[0]],
    persons: persons
  };
  expect(getRecommendation(date, members, db).length).toBe(0);
});
test("Test getRecommendation 1 - only enougth space rooms #3", () => {
  const date = makeEventDate([8, 0], [9, 0]);
  const members = [persons[1], persons[2], persons[3]];
  const db = {
    events: [makeEvent(1, "e-1", Array(2), makeEventDate([9, 0], [10, 0]), 0)],
    rooms: rooms,
    persons: persons
  };
  expect(getRecommendation(date, members, db).length).toBe(2);
});
test("Test getRecommendation 1 - closest room #1", () => {
  const date = makeEventDate([8, 0], [9, 0]);
  const members = [persons[0], persons[1]];
  const db = {
    events: [
      makeEvent(1, "e-1", Array(2), makeEventDate([9, 0], [10, 0]), 0),
      makeEvent(2, "e-1", Array(2), makeEventDate([9, 0], [10, 0]), 2)
    ],
    rooms: [rooms[0], rooms[2]],
    persons: persons
  };
  expect(getRecommendation(date, members, db)[0].room).toBe("0");
  expect(getRecommendation(date, members, db)[1].room).toBe("2");
});
test("Test getRecommendation 1 - sort free first", () => {
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
  expect(getRecommendation(date, members, db)[0].room).toBe("3");
});
// ////////
test("Test ce first", () => {
  const persons1 = [
    makePerson("person-1", 1),
    makePerson("person-2", 1),
    makePerson("person-3", 1),
    makePerson("person-4", 1)
  ];

  const rooms1 = [
    makeRoom(0, "room-0", 7, 1),
    makeRoom(1, "room-1", 5, 1),
    makeRoom(2, "room-2", 3, 1),
    makeRoom(3, "room-3", 2, 1)
  ];

  const date = makeEventDate([8, 0], [9, 0]);
  const members = [persons[0], persons[3]];
  const db = {
    events: [
      makeEvent(0, "e-1", Array(5), makeEventDate([8, 0], [14, 0]), 0),
      makeEvent(1, "e-1", Array(2), makeEventDate([8, 0], [14, 0]), 0),
      makeEvent(2, "e-1", Array(3), makeEventDate([8, 0], [11, 0]), 1),
      makeEvent(3, "e-1", Array(2), makeEventDate([11, 0], [13, 0]), 2)
    ],
    rooms: rooms1,
    persons: persons1
  };
  expect(getRecommendation(date, members, db)).toBe("3");
});
