import React, { Component } from "react";
import { graphql, compose } from "react-apollo";
import gql from "graphql-tag";

import Layout from "./Layout";

const EVENTS_QUERY = gql`
  query {
    events {
      id
      title
      dateStart
      dateEnd
      users {
        id
        login
        avatarUrl
      }
      room {
        id
      }
    }
  }
`;
const ROOMS_QUERY = gql`
  query {
    rooms {
      id
      title
      capacity
      floor
    }
  }
`;

class Diagram extends Component {
  render() {
    const {
      events: { events, loading: eventsLoading, error: eventsError }
    } = this.props;
    const {
      rooms: { rooms, loading: roomsLoading, error: roomsError }
    } = this.props;
    if (eventsLoading || roomsLoading) {
      return <p>Loading...</p>;
    }
    return <Layout />;
  }
}

Diagram = compose(
  graphql(EVENTS_QUERY, { name: "events" }),
  graphql(ROOMS_QUERY, { name: "rooms" })
)(Diagram);

export default Diagram;
