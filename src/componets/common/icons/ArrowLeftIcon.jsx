import React from "react";

const ArrowLeftIcon = props => {
  const { className, width, height, fill } = props;
  return (
    <svg className={className} width={width} height={height} viewBox="0 0 7 12">
      <title>arrow2</title>
      <path
        d="M6 10.243L1.757 6 6 1.757"
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
