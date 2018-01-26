import React from "react";
import PropTypes from "prop-types";

const ArrowLeftIcon = props => {
  const { className, width, height } = props;
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

ArrowLeftIcon.propType = {
  className: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  height: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default ArrowLeftIcon;
