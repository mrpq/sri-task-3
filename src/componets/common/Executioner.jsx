import { Component } from "react";

export default class Executioner extends Component {
  render() {
    return this.props.children();
  }
}
