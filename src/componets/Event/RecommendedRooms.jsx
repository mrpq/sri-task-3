import React, { Component, Fragment } from "react";
import PropTypes from "prop-types";

import InputLabel from "../common/gui/InputLabel";
import RecomendedRoom from "../common/gui/RecomendedRoom";
import {
  getRecommendation,
  prepareRawEventsForGetRecommendation,
  prepareRawRoomsForGetRecommendation
} from "./getRecommendation";

class RecommendedRooms extends Component {
  getRecommendation = () => {
    const { dateStart, dateEnd, members } = this.props;
    const date = { start: dateStart, end: dateEnd };
    const { events, rooms } = this.props;
    const preparedEvents = prepareRawEventsForGetRecommendation(events);
    const preparedRooms = prepareRawRoomsForGetRecommendation(rooms);
    const db = { events: preparedEvents, rooms: preparedRooms };
    const result = getRecommendation(date, members, db);
    return result;
  };

  renderSelectedRoom() {
    const {
      dateStart,
      selectedRoom,
      dateEnd,
      onRoomClick,
      onRoomDeleteClick
    } = this.props;
    return (
      <Fragment>
        <InputLabel text="Ваша переговорка" />
        <RecomendedRoom
          room={selectedRoom.value}
          dateStart={dateStart.format("HH:mm")}
          dateEnd={dateEnd.format("HH:mm")}
          selected={true}
          onClick={onRoomClick(selectedRoom.value)}
          onDeleteClick={onRoomDeleteClick}
        />
      </Fragment>
    );
  }

  renderRecommendedRooms() {
    const {
      selectedRoom: { errors },
      rooms,
      dateStart,
      onRoomClick,
      onRoomDeleteClick
    } = this.props;
    const recommendations = this.getRecommendation();
    const errorStyles = {};
    if (errors) {
      errorStyles.color = "red";
    }
    const labelText = errors
      ? "Выберите переговорку"
      : "Рекомендованные переговорки";
    return (
      <Fragment>
        <InputLabel text={labelText} style={errorStyles} />
        {recommendations.map(rec => {
          const room = rooms.find(
            room => parseInt(room.id, 10) === parseInt(rec.room, 10)
          );
          const recommendedRoom = {
            ...room,
            dateStart: rec.date.start,
            dateEnd: rec.date.end,
            swap: rec.swap
          };

          return (
            <RecomendedRoom
              key={recommendedRoom.id}
              room={recommendedRoom}
              dateStart={recommendedRoom.dateStart.format("HH:mm")}
              dateEnd={recommendedRoom.dateEnd.format("HH:mm")}
              daysDifference={Math.abs(
                recommendedRoom.dateStart.date() - dateStart.date()
              )}
              onClick={onRoomClick(recommendedRoom)}
              onDeleteClick={onRoomDeleteClick}
            />
          );
        })}
      </Fragment>
    );
  }

  render() {
    const { selectedRoom } = this.props;
    if (selectedRoom.value) {
      return this.renderSelectedRoom();
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
