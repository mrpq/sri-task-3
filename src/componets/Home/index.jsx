import React, { Component } from "react";
import PropTypes from "prop-types";

import Header from "../Header";
import Diagram from "../Diagram";
import Calendar from "../Calendar";
import { ModalCreate } from "../common/Modals";

class Home extends Component {
  render() {
    const {
      currentDate,
      handleCalendarDayClick,
      handleCalendarArrowClick,
      modalCreateVisible,
      modalCreateData,
      handleModalSubmitClick
    } = this.props;
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
        <ModalCreate
          visible={modalCreateVisible}
          data={modalCreateData}
          onSubmitClick={handleModalSubmitClick}
        />
      </div>
    );
  }
}
Home.propTypes = {
  currentDate: PropTypes.object,
  handleCalendarDayClick: PropTypes.func.isRequired,
  handleCalendarArrowClick: PropTypes.func.isRequired,
  modalCreateVisible: PropTypes.bool.isRequired,
  modalCreateData: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.instanceOf(null)
  ]),
  handleModalSubmitClick: PropTypes.func.isRequired
};

export default Home;
