import React, { useState, useEffect } from 'react';
import { FiAward, FiStar, FiTrendingUp, FiClock, FiCheckCircle } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const DriverPerformance = () => {
  const [topPerformers, setTopPerformers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDriverPerformance();
  }, []);

  const fetchDriverPerformance = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDrivers({ limit: 100 });
      if (response.success) {
        const drivers = response.data?.drivers || [];
        const sorted = drivers
          .map(d => ({
            driver: d.name,
            deliveries: d.statistics?.totalDeliveries || d.totalDeliveries || 0,
            rating: d.rating || 0,
            onTimeRate: d.statistics?.onTimeDeliveryRate || d.onTimeRate || 0
          }))
          .sort((a, b) => b.rating - a.rating);
        setTopPerformers(sorted);
      }
    } catch (error) {
      console.error('Error fetching driver performance:', error);
      setError('Failed to load driver performance');
    } finally {
      setLoading(false);
    }
  };

  const stats = topPerformers.length > 0 ? [
    { label: 'Top Rated Driver', value: topPerformers[0]?.driver || 'N/A', icon: FiAward, color: 'orange' },
    { label: 'Avg Rating', value: (topPerformers.reduce((acc, d) => acc + d.rating, 0) / topPerformers.length).toFixed(1), icon: FiStar, color: 'warning' },
    { label: 'Avg On-Time Rate', value: Math.round(topPerformers.reduce((acc, d) => acc + d.onTimeRate, 0) / topPerformers.length) + '%', icon: FiClock, color: 'success' },
    { label: 'Total Deliveries', value: topPerformers.reduce((acc, d) => acc + d.deliveries, 0), icon: FiCheckCircle, color: 'info' }
  ] : [];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-spinner">Loading performance data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Driver Performance</h1>
          <p className="page-subtitle">Track driver ratings, efficiency, and performance metrics</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">{stat.label}</span>
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon />
              </div>
            </div>
            <div className="stat-value" style={{ fontSize: typeof stat.value === 'string' && stat.value.length > 10 ? '1.25rem' : '2rem' }}>
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Performance Leaderboard */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Performance Leaderboard</h3>
          <button className="btn btn-secondary">
            <FiTrendingUp size={18} />
            Export Report
          </button>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Driver Name</th>
                <th>Total Deliveries</th>
                <th>Rating</th>
                <th>On-Time Rate</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {topPerformers.map((driver, index) => (
                <tr key={index}>
                  <td>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      borderRadius: '50%', 
                      background: index === 0 ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 
                                  index === 1 ? 'linear-gradient(135deg, #C0C0C0, #A8A8A8)' :
                                  index === 2 ? 'linear-gradient(135deg, #CD7F32, #8B4513)' : 'var(--bg-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      color: index < 3 ? 'white' : 'var(--text-primary)'
                    }}>
                      {index + 1}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{driver.driver}</td>
                  <td>{driver.deliveries}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiStar fill="var(--warning-color)" color="var(--warning-color)" size={14} />
                      <span style={{ fontWeight: 600 }}>{driver.rating}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="progress-bar" style={{ width: '80px', height: '6px' }}>
                        <div className="progress-fill" style={{ width: `${driver.onTimeRate}%` }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{driver.onTimeRate}%</span>
                    </div>
                  </td>
                  <td>
                    {driver.onTimeRate >= 95 && driver.rating >= 4.8 && (
                      <span className="status-badge completed">Excellent</span>
                    )}
                    {driver.onTimeRate >= 90 && driver.onTimeRate < 95 && (
                      <span className="status-badge in_progress">Good</span>
                    )}
                    {driver.onTimeRate < 90 && (
                      <span className="status-badge pending">Need Improvement</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DriverPerformance;
