import React from 'react';
import { FiUsers, FiTruck, FiClock, FiCheckCircle, FiDollarSign, FiAlertCircle } from 'react-icons/fi';
import MetricCard from './MetricCard';
import { mockMetrics, mockDeliveries, mockDrivers } from '../../utils/mockData';
import './DashboardHome.css';

const DashboardHome = () => {
  const metrics = [
    {
      icon: <FiUsers />,
      title: 'Active Drivers',
      value: mockMetrics.activeDrivers,
      trend: 'up',
      trendValue: '+2',
      color: 'purple'
    },
    {
      icon: <FiTruck />,
      title: 'Pending Deliveries',
      value: mockMetrics.pendingDeliveries,
      trend: 'down',
      trendValue: '-3',
      color: 'blue'
    },
    {
      icon: <FiClock />,
      title: 'Avg Delivery Time',
      value: `${mockMetrics.avgDeliveryTime} min`,
      trend: 'up',
      trendValue: '+2 min',
      color: 'yellow'
    },
    {
      icon: <FiCheckCircle />,
      title: 'Success Rate',
      value: `${mockMetrics.successRate}%`,
      trend: 'up',
      trendValue: '+1.2%',
      color: 'green'
    },
    {
      icon: <FiDollarSign />,
      title: 'Revenue Today',
      value: `${mockMetrics.revenueToday} MAD`,
      trend: 'up',
      trendValue: '+15%',
      color: 'pink'
    },
    {
      icon: <FiAlertCircle />,
      title: 'Complaints',
      value: mockMetrics.customerComplaints,
      trend: 'down',
      trendValue: '-2',
      color: 'red'
    }
  ];

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <div>
          <h2>Delivery Operations Overview</h2>
          <p className="dashboard-subtitle">Monitor and manage all delivery activities in real-time</p>
        </div>
        <button className="btn btn-primary">
          <FiTruck />
          View All Deliveries
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <MetricCard key={index} {...metric} />
        ))}
      </div>

      {/* Recent Activity Section */}
      <div className="dashboard-grid">
        {/* Active Deliveries */}
        <div className="card dashboard-card">
          <div className="card-header">
            <h3>Active Deliveries</h3>
            <span className="badge badge-primary">{mockDeliveries.filter(d => d.status === 'in_transit').length} Active</span>
          </div>
          <div className="deliveries-list">
            {mockDeliveries.slice(0, 3).map((delivery) => (
              <div key={delivery.id} className="delivery-item">
                <div className="delivery-info">
                  <div className="delivery-id">#{delivery.orderId}</div>
                  <div className="delivery-driver">{delivery.driverName}</div>
                  <div className="delivery-customer">{delivery.customerName}</div>
                </div>
                <div className="delivery-status">
                  <span className={`badge badge-${
                    delivery.status === 'delivered' ? 'success' : 
                    delivery.status === 'in_transit' ? 'primary' : 'warning'
                  }`}>
                    {delivery.status.replace('_', ' ')}
                  </span>
                  <div className="delivery-time">{delivery.estimatedTime}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-secondary btn-sm" style={{ width: '100%', marginTop: '1rem' }}>
            View All Deliveries
          </button>
        </div>

        {/* Top Drivers */}
        <div className="card dashboard-card">
          <div className="card-header">
            <h3>Top Performing Drivers</h3>
            <span className="badge badge-success">This Week</span>
          </div>
          <div className="drivers-list">
            {mockDrivers.filter(d => d.status === 'active').slice(0, 4).map((driver, index) => (
              <div key={driver.id} className="driver-item">
                <div className="driver-rank">#{index + 1}</div>
                <img src={driver.avatar} alt={driver.name} className="driver-avatar" />
                <div className="driver-info">
                  <div className="driver-name">{driver.name}</div>
                  <div className="driver-stats">{driver.totalDeliveries} deliveries</div>
                </div>
                <div className="driver-rating">
                  ⭐ {driver.rating}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card">
            <FiUsers className="action-icon" />
            <span>Manage Drivers</span>
          </button>
          <button className="action-card">
            <FiTruck className="action-icon" />
            <span>Track Deliveries</span>
          </button>
          <button className="action-card">
            <FiDollarSign className="action-icon" />
            <span>Process Payouts</span>
          </button>
          <button className="action-card">
            <FiAlertCircle className="action-icon" />
            <span>Handle Disputes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
