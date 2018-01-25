import React, { Component } from "react";

import Layout from "./Layout";

class Diagram extends Component {
  componentDidMount() {
    console.log(document.querySelector(".diagram"));
    console.log(document.querySelector(".floors"));
  }
  render() {
    return <Layout />;
  }
}

export default Diagram;
