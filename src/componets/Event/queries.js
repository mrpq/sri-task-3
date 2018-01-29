import gql from "graphql-tag";

export const EVENTS_QUERY = gql`
  query EventEvents {
    events {
      id
      title
      dateStart
      dateEnd
      users {
        id
        login
        avatarUrl
      }
      room {
        id
        title
        floor
        capacity
      }
    }
  }
`;
export const EVENT_QUERY = gql`
  query EventQuery($id: ID!) {
    event(id: $id) {
      id
      title
      dateStart
      dateEnd
      users {
        id
        login
        avatarUrl
        homeFloor
      }
      room {
        id
        title
        floor
        capacity
      }
    }
  }
`;
export const ROOMS_QUERY = gql`
  query EventRooms {
    rooms {
      id
      title
      capacity
      floor
    }
  }
`;
export const EVENT_UPDATE = gql`
  mutation UpdateEvent(
    $id: ID!
    $title: String!
    $dateStart: Date!
    $dateEnd: Date!
  ) {
    updateEvent(
      id: $id
      input: { title: $title, dateStart: $dateStart, dateEnd: $dateEnd }
    ) {
      id
    }
  }
`;
export const EVENT_USER_ADD = gql`
  mutation AddUserToEvent($id: ID!, $userId: ID!) {
    addUserToEvent(id: $id, userId: $userId) {
      id
      users {
        login
      }
    }
  }
`;
export const EVENT_USER_REMOVE = gql`
  mutation RemoveUserFromEvent($id: ID!, $userId: ID!) {
    removeUserFromEvent(id: $id, userId: $userId) {
      id
      users {
        login
      }
    }
  }
`;
export const EVENT_ROOM_CHANGE = gql`
  mutation ChangeEventRoom($id: ID!, $roomId: ID!) {
    changeEventRoom(id: $id, roomId: $roomId) {
      id
    }
  }
`;
export const EVENT_CREATE = gql`
  mutation createEvent(
    $title: String!
    $dateStart: Date!
    $dateEnd: Date!
    $usersIds: [ID]!
    $roomId: ID!
  ) {
    createEvent(
      input: { title: $title, dateStart: $dateStart, dateEnd: $dateEnd }
      usersIds: $usersIds
      roomId: $roomId
    ) {
      id
    }
  }
`;
export const EVENT_DELETE = gql`
  mutation removeEvent($id: ID!) {
    removeEvent(id: $id) {
      id
    }
  }
`;
