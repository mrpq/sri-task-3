import React from "react";

const ArrowLeftIcon = props => {
  const { className, width, height, fill } = props;
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 7 12">
      <title>arrow</title>
      <path
        d="M1 1.757L5.243 6 1 10.243"
        stroke="#000"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeOpacity=".428"
      />
    </svg>
  );
};

export default ArrowLeftIcon;
