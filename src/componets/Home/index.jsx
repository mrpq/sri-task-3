import React, { Component } from "react";
import moment from "moment";

import Header from "../Header";
import Diagram from "../Diagram";
import Calendar from "../Calendar";

const Home = props => {
  const {
    currentDate,
    handleCalendarDayClick,
    handleCalendarArrowClick
  } = props;
  return (
    <div className="page__wrapper">
      <Header />
      <Calendar
        currentDate={currentDate}
        onArrowClick={handleCalendarArrowClick}
        onDayClick={handleCalendarDayClick}
        selectedDay={new Date(currentDate)}
      />
      <Diagram currentDate={currentDate} />
    </div>
  );
};

export default Home;
