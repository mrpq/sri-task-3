import React from "react";
import PropTypes from "prop-types";
import moment from "moment";

import FloorsList from "./FloorsList";
import { createGridStylesForTimeRange } from "../../utils";

const CurrentTime = props => {
  const now = moment(new Date());
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
      {[...Array(16).keys()].map(i => {
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
      </div>
    </div>
  );
};

Diagram.propTypes = {};

export default Diagram;
