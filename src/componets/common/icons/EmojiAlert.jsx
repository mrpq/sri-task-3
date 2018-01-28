import React from "react";

const EmojiSuccess = props => {
  const { className, width, height } = props;
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 40 38"
    >
      <title>emoji1</title>
      <text
        transform="translate(-1 -7)"
        fillRule="evenodd"
        fontFamily="AppleColorEmoji, Apple Color Emoji"
        fontSize="40"
      >
        <tspan x=".5" y="40">
          🙅🏻
        </tspan>
      </text>
    </svg>
  );
};

export default EmojiSuccess;
