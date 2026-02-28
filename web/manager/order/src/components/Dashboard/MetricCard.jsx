import React from 'react';
import './MetricCard.css';

const MetricCard = ({ icon: Icon, label, value, trend, trendValue, color = 'orange' }) => {
  const isPositive = trend === 'up';
  
  return (
    <div className={`metric-card gradient-${color}`}>
      <div className="metric-icon-wrapper">
        <div className={`metric-icon icon-${color}`}>
          <Icon size={24} />
        </div>
      </div>
      <div className="metric-content">
        <span className="metric-label">{label}</span>
        <h3 className="metric-value">{value}</h3>
        {trendValue && (
          <div className={`metric-trend ${isPositive ? 'positive' : 'negative'}`}>
            <span className="trend-arrow">{isPositive ? '↑' : '↓'}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricCard;
