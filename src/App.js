import React, { Component, Fragment } from "react";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "react-apollo";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

import moment from "moment";

import Home from "./componets/Home/";
import Event from "./componets/Event/";

const client1 = new ApolloClient({
  link: new HttpLink({
    uri: "http://localhost:3000/graphgl"
  }),
  // link: new BatchHttpLink({
  //   uri: "http://localhost:3000/graphgl"
  // }),

  cache: new InMemoryCache()
});

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentDate: moment(),
      modalCreateVisible: false,
      modalCreateData: null
    };
  }
  handleCalendarArrowClick = direction => () => {
    this.setState(prevState => {
      const d = prevState.currentDate;
      return {
        currentDate: d.date(d.date() + direction)
      };
    });
  };
  handleCalendarDayClick = (day, { selected }) => {
    this.setState({ currentDate: moment(day) });
  };
  toggleModalCreate = () => {
    this.setState(prevState => ({
      ...prevState,
      modalCreateVisible: !prevState.modalCreateVisible
    }));
  };

  setModalCreateData = data => {
    this.setState(prevState => ({
      ...prevState,
      modalCreateData: data
    }));
  };

  render() {
    return (
      <ApolloProvider client={client1}>
        <Router>
          <Fragment>
            <Route
              exact
              path="/"
              component={props => (
                <Home
                  {...props}
                  handleCalendarDayClick={this.handleCalendarDayClick}
                  handleCalendarArrowClick={this.handleCalendarArrowClick}
                  currentDate={this.state.currentDate}
                  modalCreateVisible={this.state.modalCreateVisible}
                  modalCreateData={this.state.modalCreateData}
                  handleModalSubmitClick={this.toggleModalCreate}
                />
              )}
            />
            <Switch>
              <Route
                exact
                path="/event/create/:timeStart?/:timeEnd?/:roomId?"
                component={props => (
                  <Event
                    {...props}
                    currentDate={this.state.currentDate}
                    setModalCreateData={this.setModalCreateData}
                    toggleModalCreate={this.toggleModalCreate}
                  />
                )}
              />
              <Route
                exact
                path="/event/edit/:id"
                component={props => (
                  <Event
                    {...props}
                    currentDate={this.state.currentDate}
                    setModalCreateData={this.setModalCreateData}
                    toggleModalCreate={this.toggleModalCreate}
                  />
                )}
              />
            </Switch>
          </Fragment>
        </Router>
      </ApolloProvider>
    );
  }
}

export default App;
