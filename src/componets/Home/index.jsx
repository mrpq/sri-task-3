import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

import DatePickerInput from "../common/gui/DatePickerInput";
import DayPicker from "react-day-picker";
import DayPickerInput from "react-day-picker/DayPickerInput";
import "react-day-picker/lib/style.css";

const MY_QUERY = gql`
  query MyQuery($id: ID!) {
    event(id: $id) {
      room {
        title
        capacity
      }
      title
    }
  }
`;

class Home extends Component {
  render() {
    return (
      <div>
        <DayPickerInput />
      </div>
    );
  }
}

const queryOptions = {
  options: props => {
    return {
      variables: {
        id: 1
      }
    };
  }
};

// Home = graphql(MY_QUERY, queryOptions)(Home);

export default Home;
