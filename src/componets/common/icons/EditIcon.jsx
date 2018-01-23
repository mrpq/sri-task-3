import React, { Component } from "react";

class CloseIcon extends Component {
  render() {
    return (
      <svg
        className={this.props.className}
        width={this.props.width}
        height={this.props.height}
      >
        <title>edit</title>
        <g fill="none" fillRule="evenodd">
          <path d="M-2-2h16v16H-2z" />
          <path
            d="M11.08 3.106a.58.58 0 0 0 0-.822L9.714.919a.58.58 0 0 0-.823 0L7.82 1.986l2.187 2.187 1.073-1.067zM.75 9.06v2.187h2.187l6.451-6.456-2.187-2.188L.75 9.061z"
            fill={this.props.fill || "#000"}
            fillRule="nonzero"
          />
        </g>
      </svg>
    );
  }
}

export default CloseIcon;
