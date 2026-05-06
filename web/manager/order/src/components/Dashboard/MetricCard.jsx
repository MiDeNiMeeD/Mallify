import React from 'react';

const MetricCard = ({ icon: Icon, label, value, color = 'orange' }) => {
  const colorMap = {
    green: 'success',
    blue: 'info',
    red: 'danger',
    orange: 'orange'
  };
  const iconColor = colorMap[color] || 'orange';

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <span className="stat-label">{label}</span>
        <div className={`stat-icon ${iconColor}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="stat-value">{value}</div>
    </div>
  );
};

export default MetricCard;
