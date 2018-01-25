import React, { Component } from "react";
import moment from "moment";

import Header from "../Header";
import Diagram from "../Diagram";
import Calendar from "../Calendar";

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDate: moment()
    };
  }
  handleCalendarArrowClick = direction => () => {
    this.setState(prevState => {
      const d = prevState.currentDate;
      return {
        currentDate: d.date(d.date() + direction)
      };
    });
  };
  handleCalendarDayClick = (day, { selected }) => {
    this.setState({ currentDate: moment(day) });
  };

  render() {
    return (
      <div className="page__wrapper">
        <Header />
        <Calendar
          currentDate={this.state.currentDate}
          onArrowClick={this.handleCalendarArrowClick}
          onDayClick={this.handleCalendarDayClick}
          selectedDay={new Date(this.state.currentDate)}
        />
        <Diagram />
      </div>
    );
  }
}

export default Home;
