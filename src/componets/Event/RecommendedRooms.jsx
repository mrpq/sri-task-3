import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";
import moment from "moment";

import InputLabel from "../common/gui/InputLabel";
import RecomendedRoom from "../common/gui/RecomendedRoom";
import { getRecommendation } from "../../utils/getRecommendation";

class RecommendedRooms extends Component {
  getRecommendation = () => {
    const { dateStart, dateEnd, members } = this.props;
    const date = { start: dateStart, end: dateEnd };
    const { events, rooms } = this.props;
    const preparedEvents = this.prepareRawEventsForGetRecommendation(events);
    const preparedRooms = this.prepareRawRoomsForGetRecommendation(rooms);
    const db = { events: preparedEvents, rooms: preparedRooms };
    const result = getRecommendation(date, members, db);
    return result;
  };

  prepareRawEventsForGetRecommendation = events => {
    return events.map(event => {
      return {
        ...event,
        members: event.users,
        room: parseInt(event.room.id, 10),
        date: {
          start: moment(event.dateStart),
          end: moment(event.dateEnd)
        }
      };
    });
  };
  prepareRawRoomsForGetRecommendation = rooms => {
    return rooms.map(room => ({ ...room, id: parseInt(room.id, 10) }));
  };

  renderSelectedRoom(room) {
    const { dateStart, dateEnd, onRoomClick, onRoomDeleteClick } = this.props;
    return (
      <Fragment>
        <InputLabel text="Ваша переговорка" />
        <RecomendedRoom
          room={room}
          dateStart={dateStart.format("HH:mm")}
          dateEnd={dateEnd.format("HH:mm")}
          selected={true}
          onClick={onRoomClick(room.id)}
          onDeleteClick={onRoomDeleteClick}
        />
      </Fragment>
    );
  }

  renderRecommendedRooms() {
    const { rooms, onRoomClick, onRoomDeleteClick } = this.props;
    const recommendations = this.getRecommendation();
    return (
      <Fragment>
        <InputLabel text="Рекомендованные переговорки" />
        {recommendations.map(rec => {
          const room = rooms.find(
            room => parseInt(room.id, 10) === parseInt(rec.room, 10)
          );
          return (
            <RecomendedRoom
              key={rec.room}
              room={room}
              dateStart={rec.date.start.format("HH:mm")}
              dateEnd={rec.date.end.format("HH:mm")}
              onClick={onRoomClick(room.id)}
              onDeleteClick={onRoomDeleteClick}
            />
          );
        })}
      </Fragment>
    );
  }

  render() {
    const { selectedRoom } = this.props;
    if (selectedRoom) {
      return this.renderSelectedRoom(selectedRoom);
    } else {
      return this.renderRecommendedRooms();
    }
  }
}

RecommendedRooms.propTypes = {
  dateStart: PropTypes.object.isRequired,
  dateEnd: PropTypes.object.isRequired,
  selectedRoom: PropTypes.object,
  onRoomClick: PropTypes.func.isRequired,
  onRoomDeleteClick: PropTypes.func.isRequired,
  rooms: PropTypes.array,
  events: PropTypes.array
};

export default RecommendedRooms;
