import React from "react";
import PropTypes from "prop-types";

import DayPicker from "react-day-picker";
import "react-day-picker/lib/style.css";

import ArrowLeftIcon from "../common/icons/ArrowLeftIcon";
import ArrowRightIcon from "../common/icons/ArrowRightIcon";

import "./calendar.css";

const Calendar = props => {
  const { currentDate, onArrowClick, onDayClick, selectedDay } = props;
  const calendarFormats = {
    sameDay: "Сегодня",
    nextDay: "Завтра",
    lastDay: "Вчера",
    sameElse: ""
  };
  let date = "";
  let day = "";
  const todayYesterDay = currentDate.calendar(null, calendarFormats);
  if (
    todayYesterDay === "Сегодня" ||
    todayYesterDay === "Завтра" ||
    todayYesterDay === "Вчера"
  ) {
    date = `${currentDate.format("D MMM").replace(/\.$/, "")} · `;
    day = todayYesterDay;
  } else {
    date = currentDate.format("D MMMM YYYY");
  }

  return (
    <div className="calendar">
      <div className="calendar__slider">
        <div className="calendar-slider">
          <div className="calendar-slider__arrow" onClick={onArrowClick(-1)}>
            <ArrowLeftIcon className="calendar-slider__icon-left" />
          </div>
          <div className="calendar-slider__date-container">
            <span className="calednar-slider__date">{date}</span>
            <span className="calednar-slider__day">{day}</span>
            <div className="calendar-picker-container">
              <div className="calendar-picker-inside">
                <DayPicker onDayClick={onDayClick} selectedDays={selectedDay} />
              </div>
            </div>
          </div>
          <div className="calendar-slider__arrow" onClick={onArrowClick(1)}>
            <ArrowRightIcon className="calendar-slider__icon-right" />
          </div>
        </div>
      </div>
    </div>
  );
};

Calendar.propTypes = {
  currentDate: PropTypes.object.isRequired,
  onArrowClick: PropTypes.func.isRequired,
  onDayClick: PropTypes.func.isRequired,
  selectedDay: PropTypes.object
};

export default Calendar;
