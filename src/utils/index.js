import moment from "moment";

export const round5 = x => {
  return Math.ceil(x / 5) * 5;
};

export const createGridStylesForTimeRange = (timeStart, timeEnd) => {
  timeStart = moment(timeStart).startOf("minute");
  const dayStart = moment()
    .hours(8)
    .startOf("hour");
  const offset = 3;
  let duration = 1;
  const columnStart = Math.floor((timeStart - dayStart) / 60000);
  let msStyles = `-ms-grid-column: ${columnStart + offset}; `;
  if (timeEnd) {
    timeEnd = moment(timeEnd).startOf("minute");
    duration = Math.floor((timeEnd - timeStart) / 60000);
  }

  return {
    msGridColumn: `${columnStart + offset}`,
    msGridColumnSpan: `${duration}`,
    gridColumn: `${columnStart + offset}/${columnStart + offset + duration}`
  };
  // return msStyles + regularStyles;
};