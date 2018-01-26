import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

import { Link, Redirect, withRouter } from "react-router-dom";

import EditIcon from "../common/icons/EditIcon";
import { createGridStylesForTimeRange } from "../../utils";
import moment from "moment";
moment.locale("ru");

const EVENTS_QUERY = gql`
  query {
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
      }
    }
  }
`;

let FreeSlot = props => {
  const { timeStart, timeEnd, room, history } = props;
  const styles = createGridStylesForTimeRange(timeStart, timeEnd);
  // styles.display = "block";
  return (
    // <Link to="/event/create" style={styles}>
    <div
      style={styles}
      className="room__meeting room__meeting--free js-room-meeting-free"
      onClick={() => {
        history.push(
          `/event/create/${timeStart.valueOf()}/${timeEnd.valueOf()}`
        );
      }}
    >
      <div className="room__meeting-inside-left">
        <button className="room__meeting-create-button" />
      </div>
    </div>
    // </Link>
  );
};
FreeSlot = withRouter(FreeSlot);

const Event = props => {
  const { room, event: { id, title, dateStart, dateEnd, users } } = props;
  const styles = createGridStylesForTimeRange(dateStart, dateEnd);
  const displayUsers = () => {
    if (users.length == 1) return null;
    let word;
    switch (true) {
      case users.length - 1 === 1:
        word = "участник";
        break;
      case users.length - 1 > 1 && users.length - 1 < 5:
        word = "участника";
        break;
      default:
        word = "участников";
    }
    return (
      <div className="attendees__amount">
        &nbsp;{` и ${users.length - 1} ${word}`}
      </div>
    );
  };
  return (
    <div
      className="room__meeting room__meeting--busy js-room-meeting-busy"
      style={styles}
    >
      <div className="meeting-tooltip-triangle js-meeting-tooltip-triangle" />
      <div className="meeting-tooltip js-meeting-tooltip">
        <Link to={`/event/edit/${id}`}>
          <div className="meeting-tooltip__edit">
            <EditIcon
              width="12"
              height="12"
              className="meeting-tooltip__edit-icon"
            />
          </div>
        </Link>
        <h3 className="meeting-tooltip__heading">{title}</h3>
        <div className="meeting-tooltip__meta">
          {/* <span className="meeting-tooltip__date">{`${moment(event)}.`}</span> */}
          <span className="meeting-tooltip__date">
            {`${moment(dateStart).format("D MMMM")} `}
          </span>
          <span className="meeting-tooltip__time">{`${moment(dateStart).format(
            "HH:mm"
          )}—${moment(dateEnd).format("HH:mm")} `}</span>
          <span className="meeting-tooltip__room">{`· ${room.title}`}</span>
        </div>
        <div className="meeting-tooltip__attendees attendees">
          <div
            className="attendees__ava"
            style={{
              backgroundImage: `url("${users[0].avatarUrl ||
                "./img/assets/room/ava.jpeg"}"`
            }}
          />
          <div className="attendees__name">{users[0].login}</div>
          {displayUsers()}
          {/* <div className="attendees__amount"> и 12 участников</div> */}
        </div>
      </div>
    </div>
  );
};

class RoomsItem extends Component {
  createRoomEventsAndFreeSlots(roomEvents) {
    const { room } = this.props;
    const eventsAndFreeSlots = [];
    if (roomEvents.length === 0) {
      eventsAndFreeSlots.push({
        type: "free",
        timeStart: moment()
          .hour(8)
          .startOf("hour"),
        timeEnd: moment()
          .hour(23)
          .startOf("hour"),
        room
      });
    }
    for (let i = 0; i <= roomEvents.length - 1; i += 1) {
      const event = roomEvents[i];
      const eventStart = moment(event.dateStart).startOf("minute");
      const eventEnd = moment(event.dateEnd).startOf("minute");
      if (i === 0) {
        // insert free slot before first event
        const dayStart = moment(event.dateStart)
          .hours(8)
          .startOf("hour");
        const freeTimeBeforeEvent = (eventStart - dayStart) / 60000;
        if (freeTimeBeforeEvent > 0)
          eventsAndFreeSlots.push({
            type: "free",
            timeStart: dayStart,
            timeEnd: eventStart,
            room
          });
      } else {
        // insert free slot between events
        const previousEventEnd = moment(roomEvents[i - 1].dateEnd).startOf(
          "minute"
        );
        const timeGapBetweenEvents = (eventStart - previousEventEnd) / 60000;
        if (timeGapBetweenEvents > 0) {
          eventsAndFreeSlots.push({
            type: "free",
            timeStart: previousEventEnd,
            timeEnd: eventStart,
            room
          });
        }
      }
      // insert event
      eventsAndFreeSlots.push({
        type: "event",
        timeStart: eventStart,
        timeEnd: eventEnd,
        event: roomEvents[i]
      });

      if (i === roomEvents.length - 1) {
        // insert free slot after event
        const dayEnd = moment(event.dateEnd)
          .hours(23)
          .startOf("hour");
        const freeTimeAfterEvent = (dayEnd - eventEnd) / 60000;
        if (freeTimeAfterEvent > 0) {
          eventsAndFreeSlots.push({
            type: "free",
            timeStart: eventEnd,
            timeEnd: dayEnd,
            room
          });
        }
      }
    }
    return eventsAndFreeSlots;
  }
  render() {
    // add disabled room meta and tooltip modifier

    const { room, events: { events, loading }, currentDate } = this.props;
    if (loading) return <p>loading...</p>;
    const roomEvents = events
      .filter(event => {
        return moment(event.dateStart).isSame(moment(currentDate), "day");
      })
      .filter(event => {
        return event.room.id === room.id;
      })
      .sort((a, b) => moment(a.dateEnd) - moment(b.dateStart));
    const eventsAndFreeSlots = this.createRoomEventsAndFreeSlots(roomEvents);
    return (
      <li className="floor__room room diagram-grid">
        <div className="room__meta">
          <div className="room__tooltip">{room.title}</div>
          <div className="room__meta-content">
            <span className="room__meta-name">{room.title}</span>
            <br />
            <span className="room__meta-capacity">{`${
              room.capacity
            } человек`}</span>
          </div>
        </div>
        <div className="room-diagram-filler room-diagram-filler--start">
          <div className="room-diagram-filler__inner" />
        </div>
        {eventsAndFreeSlots.map((item, i) => {
          if (item.type === "event") {
            return <Event key={i} event={item.event} room={room} />;
          } else {
            return <FreeSlot key={i} {...item} />;
          }
        })}
      </li>
    );
  }
}

RoomsItem = graphql(EVENTS_QUERY, { name: "events" })(RoomsItem);

export default RoomsItem;
