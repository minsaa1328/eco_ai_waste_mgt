import React from 'react';
import PropTypes from 'prop-types';

export const Badge = ({ children, color = 'green', className = '' }) => {
  const colorClasses = {
    green: 'bg-green-100 text-green-800',
    blue: 'bg-blue-100 text-blue-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    red: 'bg-red-100 text-red-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClasses[color]} ${className}`}
    >
      {children}
    </span>
  );
};

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['green', 'blue', 'yellow', 'red', 'gray']),
  className: PropTypes.string,
};
