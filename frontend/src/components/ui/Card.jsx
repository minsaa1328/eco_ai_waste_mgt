import React from 'react';
import PropTypes from 'prop-types';

export const Card = ({ title, children, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 ${className}`}>
      {title && (
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">{title}</h3>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};

Card.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
