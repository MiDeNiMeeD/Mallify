import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiClock, FiTarget, FiAward } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const EfficiencyMetrics = () => {
  const [driverPerformance, setDriverPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEfficiencyMetrics();
  }, []);

  const fetchEfficiencyMetrics = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDrivers({ limit: 100 });
      
      if (response.success) {
        const drivers = response.data?.drivers || [];
        const performance = drivers.map(d => ({
          driver: d.name,
          onTimeRate: d.statistics?.onTimeDeliveryRate || d.onTimeRate || 0
        }));
        setDriverPerformance(performance);
      }
    } catch (error) {
      console.error('Error fetching efficiency metrics:', error);
      setError('Failed to load efficiency metrics');
    } finally {
      setLoading(false);
    }
  };

  const avgOnTimeRate = driverPerformance.length > 0
    ? Math.round(driverPerformance.reduce((acc, d) => acc + d.onTimeRate, 0) / driverPerformance.length)
    : 0;

  const stats = [
    { label: 'On-Time Rate', value: `${avgOnTimeRate}%`, icon: FiClock, color: 'success' },
    { label: 'Efficiency Score', value: '92/100', icon: FiTrendingUp, color: 'orange' },
    { label: 'Target Achievement', value: '87%', icon: FiTarget, color: 'info' },
    { label: 'Quality Rating', value: '4.7/5', icon: FiAward, color: 'warning' }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-spinner">Loading efficiency metrics...</div>
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
          <h1 className="page-title">Efficiency Metrics</h1>
          <p className="page-subtitle">Track and optimize delivery efficiency metrics</p>
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
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Efficiency Breakdown */}
      <div className="grid-2">
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Driver Efficiency</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: '1rem' }}>
              {driverPerformance.slice(0, 10).map((driver, index) => (
                <div key={index}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{driver.driver}</span>
                    <span style={{ fontSize: '0.875rem', color: 'var(--success-color)', fontWeight: 600 }}>
                      {driver.onTimeRate}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${driver.onTimeRate}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Performance Metrics</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'var(--success-light)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--success-color)', marginBottom: '0.25rem' }}>
                  Average Delivery Time
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                  28 min
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--info-light)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--info-color)', marginBottom: '0.25rem' }}>
                  Completion Rate
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--info-color)' }}>
                  96.5%
                </div>
              </div>
              <div style={{ padding: '1rem', background: 'var(--warning-light)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--warning-color)', marginBottom: '0.25rem' }}>
                  Customer Satisfaction
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--warning-color)' }}>
                  4.8/5
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EfficiencyMetrics;
