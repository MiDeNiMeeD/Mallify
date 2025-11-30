import React from 'react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import './MetricCard.css';

const MetricCard = ({ icon, title, value, trend, trendValue, color = 'purple' }) => {
  const isPositive = trend === 'up';
  
  return (
    <div className={`metric-card metric-card-${color}`}>
      <div className="metric-header">
        <div className={`metric-icon metric-icon-${color}`}>
          {icon}
        </div>
        <div className="metric-trend">
          {isPositive ? (
            <FiTrendingUp className="trend-icon trend-up" />
          ) : (
            <FiTrendingDown className="trend-icon trend-down" />
          )}
          <span className={`trend-value ${isPositive ? 'trend-up' : 'trend-down'}`}>
            {trendValue}
          </span>
        </div>
      </div>
      
      <div className="metric-content">
        <h3 className="metric-value">{value}</h3>
        <p className="metric-title">{title}</p>
      </div>
    </div>
  );
};

export default MetricCard;
