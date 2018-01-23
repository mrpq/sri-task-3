import React, { Component, Fragment } from "react";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloProvider } from "react-apollo";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";

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
  render() {
    return (
      <ApolloProvider client={client1}>
        <Router>
          <Fragment>
            <Route exact path="/" component={Home} />
            <Switch>
              <Route exact path="/event/create" component={Event} />
              <Route exact path="/event/edit/:id" component={Event} />
            </Switch>
          </Fragment>
        </Router>
      </ApolloProvider>
    );
  }
}

export default App;
