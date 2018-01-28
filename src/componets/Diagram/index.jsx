import React from "react";
import PropTypes from "prop-types";
import moment from "moment";

import FloorsList from "./FloorsList";
import { createGridStylesForTimeRange } from "../../utils";
import Footer from "./Footer";

const CurrentTime = props => {
  const now = moment(new Date());
  if (now.hour() <= 8 || now.hour() >= 23) return null;
  const styles = createGridStylesForTimeRange(now);
  return (
    <div className="diagram__curr-time diagram-grid">
      <div className="diagram__curr-time-label" style={styles}>
        {now.format("HH:mm")}
      </div>
    </div>
  );
};

const DiagramHours = props => {
  return (
    <div className="diagram__hours hours diagram-grid">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(i => {
        const time = moment()
          .hour(i + 8)
          .minutes(0);
        const styles = createGridStylesForTimeRange(time);
        return (
          <div key={i} className="hours__label" style={styles}>
            <span>{time.format("HH")}</span>
            <div className="hours__bar" />
          </div>
        );
      })}
    </div>
  );
};

const Diagram = props => {
  const { currentDate } = props;
  return (
    <div className="diagram-wrapper">
      <div className="diagram">
        <CurrentTime />
        <DiagramHours />
        <FloorsList currentDate={currentDate.valueOf()} />
        <Footer />
      </div>
    </div>
  );
};

Diagram.propTypes = {
  currentDate: PropTypes.object.isRequired
};

export default Diagram;
