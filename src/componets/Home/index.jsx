import React, { Component } from "react";

import Header from "../Header";
import Diagram from "../Diagram";

class Home extends Component {
  render() {
    return (
      <div className="page__wrapper">
        <Header />
        <Diagram />
      </div>
    );
  }
}

export default Home;
