import React, { useState } from 'react';
import { FiActivity, FiTrendingUp, FiUsers } from 'react-icons/fi';
import '../Analytics/AnalyticsOverview.css';

const PerformanceAnalyticsPage = () => {
  const [performance] = useState({ uptime: 99.8, avgResponseTime: 120, activeUsers: 1250 });

  return (
    <div className="analytics-page">
      <div className="page-header">
        <div><h1><FiActivity /> Platform Performance</h1><p>System health and performance metrics</p></div>
      </div>
      <div className="analytics-stats">
        <div className="stat-card">
          <FiTrendingUp className="stat-icon growth" />
          <div className="stat-details"><h3>{performance.uptime}%</h3><p>System Uptime</p></div>
        </div>
        <div className="stat-card">
          <FiActivity className="stat-icon users" />
          <div className="stat-details"><h3>{performance.avgResponseTime}ms</h3><p>Avg Response</p></div>
        </div>
        <div className="stat-card">
          <FiUsers className="stat-icon orders" />
          <div className="stat-details"><h3>{performance.activeUsers}</h3><p>Active Users Now</p></div>
        </div>
      </div>
      <div className="quick-insights">
        <div className="insight-card">
          <div className="insight-icon positive"><FiTrendingUp /></div>
          <div><h4>Excellent Performance</h4><p>All systems operating optimally</p></div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceAnalyticsPage;
