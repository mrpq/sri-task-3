import moment from "moment";
import { updateCurrentDate } from "../appStateUpdaters";
const initState = ({ currentDate = moment() }) => {
  return {
    currentDate
  };
};
describe("updateCurrentDate", () => {
  it("returns state with correct date on date increase", () => {
    const currentDate = moment(new Date(2018, 1, 10));
    const initialState = initState({
      currentDate
    });
    const direction = 1;
    const newState = updateCurrentDate(direction)(initialState);
    const actual = newState.currentDate.isSame(moment(new Date(2018, 1, 11)));
    const expected = true;
    expect(actual).toEqual(expected);
  });
  it("returns state with correct date on date decrease", () => {
    const currentDate = moment(new Date(2018, 1, 10));
    const initialState = initState({
      currentDate
    });
    const direction = -1;
    const newState = updateCurrentDate(direction)(initialState);
    const actual = newState.currentDate.isSame(moment(new Date(2018, 1, 9)));
    const expected = true;
    expect(actual).toEqual(expected);
  });
});
