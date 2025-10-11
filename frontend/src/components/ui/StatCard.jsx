import React from 'react';
import PropTypes from 'prop-types';

export const StatCard = ({ title, value, icon, trend, className = '' }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 p-5 ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-800">{value}</p>

          {trend && (
            <div className="mt-1 flex items-center">
              <span
                className={`text-xs font-medium ${
                  trend.positive ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {trend.positive ? '+' : ''}
                {trend.value}
              </span>
              <span className="ml-1 text-xs text-gray-500">vs yesterday</span>
            </div>
          )}
        </div>

        <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node.isRequired,
  trend: PropTypes.shape({
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    positive: PropTypes.bool,
  }),
  className: PropTypes.string,
};
