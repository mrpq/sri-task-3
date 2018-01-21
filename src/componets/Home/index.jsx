import React, { Component } from "react";
import { graphql } from "react-apollo";
import gql from "graphql-tag";

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
        <pre>{JSON.stringify(this.props.data, " ", 2)}</pre>
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

Home = graphql(MY_QUERY, queryOptions)(Home);

export default Home;
