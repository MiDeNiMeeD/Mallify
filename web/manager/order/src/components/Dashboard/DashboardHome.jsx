import React, { useState, useEffect } from 'react';
import { FiUsers, FiTruck, FiClock, FiCheckCircle, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import MetricCard from './MetricCard';
import apiClient from '../../api/apiClient';
import './DashboardHome.css';

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeDrivers: 0,
    pendingDeliveries: 0,
    avgDeliveryTime: '0 min',
    successRate: '0%',
    revenueToday: '$0',
    complaints: 0,
    totalDeliveries: 0,
    inTransitDeliveries: 0,
    completedDeliveries: 0,
    failedDeliveries: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDashboardStats();
      
      if (response.success && response.data) {
        const data = response.data;
        setStats({
          activeDrivers: data.activeDrivers || 0,
          pendingDeliveries: data.pendingDeliveries || 0,
          avgDeliveryTime: '28 min', // Can be calculated from delivery data
          successRate: '96.5%', // Can be calculated from delivery data
          revenueToday: '$1,240', // Needs financial data integration
          complaints: 0, // Needs dispute/issue service integration
          totalDeliveries: data.totalDeliveries || 0,
          inTransitDeliveries: data.inTransitDeliveries || 0,
          completedDeliveries: data.completedDeliveries || 0,
          failedDeliveries: data.totalDeliveries - data.completedDeliveries - data.inTransitDeliveries - data.pendingDeliveries || 0
        });

        // Create activity from recent deliveries
        if (data.recentDeliveries && data.recentDeliveries.length > 0) {
          const activities = data.recentDeliveries.slice(0, 5).map(delivery => ({
            text: `Delivery ${delivery.trackingNumber || delivery._id} - ${delivery.status}`,
            time: new Date(delivery.createdAt).toLocaleTimeString(),
            type: delivery.status === 'delivered' ? 'success' : delivery.status === 'pending' ? 'warning' : 'info'
          }));
          setRecentActivity(activities);
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeDeliveries = stats.inTransitDeliveries + stats.pendingDeliveries;
  const activeDriversCount = stats.activeDrivers;

  if (loading) {
    return (
      <div className="dashboard-home">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Delivery Dashboard</h1>
          <p className="dashboard-subtitle">Monitor and manage all delivery operations</p>
        </div>
        <div className="dashboard-date">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        <MetricCard
          icon={FiUsers}
          label="Active Drivers"
          value={stats.activeDrivers}
          trend="up"
          trendValue=""
          color="orange"
        />
        <MetricCard
          icon={FiTruck}
          label="Pending Deliveries"
          value={stats.pendingDeliveries}
          trend="down"
          trendValue=""
          color="blue"
        />
        <MetricCard
          icon={FiClock}
          label="Avg Delivery Time"
          value={stats.avgDeliveryTime}
          trend="down"
          trendValue=""
          color="green"
        />
        <MetricCard
          icon={FiCheckCircle}
          label="Success Rate"
          value={stats.successRate}
          trend="up"
          trendValue=""
          color="green"
        />
        <MetricCard
          icon={FiDollarSign}
          label="Revenue Today"
          value={stats.revenueToday}
          trend="up"
          trendValue=""
          color="orange"
        />
        <MetricCard
          icon={FiAlertCircle}
          label="Active Issues"
          value={stats.complaints}
          trend="down"
          trendValue=""
          color="red"
        />
      </div>

      {/* Content Grid */}
      <div className="content-grid">
        {/* Active Deliveries Map */}
        <div className="content-card map-card">
          <div className="card-header">
            <h3>Live Delivery Map</h3>
            <span className="badge badge-success">{activeDeliveries} Active</span>
          </div>
          <div className="map-placeholder">
            <div className="map-overlay">
              <FiTruck size={48} />
              <p>Interactive Map View</p>
              <span className="map-info">{activeDriversCount} drivers online • {activeDeliveries} deliveries in progress</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="content-card activity-card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button className="btn btn-sm btn-secondary">View All</button>
          </div>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={index} className={`activity-item activity-${activity.type}`}>
                  <div className="activity-indicator"></div>
                  <div className="activity-content">
                    <p className="activity-text">{activity.text}</p>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn">
            <FiTruck size={20} />
            <span>Assign Delivery</span>
          </button>
          <button className="action-btn">
            <FiUsers size={20} />
            <span>Manage Drivers</span>
          </button>
          <button className="action-btn">
            <FiAlertCircle size={20} />
            <span>View Issues</span>
          </button>
          <button className="action-btn">
            <FiDollarSign size={20} />
            <span>Process Payouts</span>
          </button>
        </div>
      </div>

      {/* Delivery Status Overview */}
      <div className="content-card">
        <div className="card-header">
          <h3>Today's Deliveries Overview</h3>
        </div>
        <div className="delivery-stats">
          <div className="stat-item">
            <div className="stat-icon success">
              <FiCheckCircle size={24} />
            </div>
            <div className="stat-content">
              <h4>Completed</h4>
              <p className="stat-value">{stats.completedDeliveries}</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon info">
              <FiTruck size={24} />
            </div>
            <div className="stat-content">
              <h4>In Transit</h4>
              <p className="stat-value">{stats.inTransitDeliveries}</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon warning">
              <FiClock size={24} />
            </div>
            <div className="stat-content">
              <h4>Pending</h4>
              <p className="stat-value">{stats.pendingDeliveries}</p>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-icon error">
              <FiAlertCircle size={24} />
            </div>
            <div className="stat-content">
              <h4>Failed</h4>
              <p className="stat-value">{stats.failedDeliveries}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
