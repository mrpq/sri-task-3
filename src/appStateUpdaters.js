import moment from "moment";

export const updateCurrentDate = direction => prevState => {
  return {
    ...prevState,
    currentDate: prevState.currentDate
      .clone()
      .date(prevState.currentDate.date() + direction)
  };
};
