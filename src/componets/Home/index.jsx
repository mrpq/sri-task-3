import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

import TimeInput from "../common/gui/TimeInput";

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
        <TimeInput />
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
