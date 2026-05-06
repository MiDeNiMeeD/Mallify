import React, { useState, useEffect } from 'react';
import {
  FiUsers,
  FiTruck,
  FiClock,
  FiCheckCircle,
  FiDollarSign,
  FiAlertCircle,
  FiTrendingUp,
  FiMapPin,
  FiUserCheck,
  FiAlertTriangle,
  FiActivity
} from 'react-icons/fi';
import MetricCard from './MetricCard';
import apiClient from '../../api/apiClient';
import {
  deliveries,
  drivers as mockDrivers,
  analyticsData,
  earnings,
  issues,
  zones
} from '../../utils/mockData';
import '../../styles/Dashboard.css';
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
  const assignmentQueue = deliveries
    .filter(delivery => delivery.status === 'pending')
    .slice(0, 5);
  const lateAlerts = deliveries
    .filter(delivery => delivery.status === 'in_transit' || delivery.status === 'pending')
    .slice(0, 4);
  const topDrivers = analyticsData.driverPerformance.slice(0, 5);
  const openIncidents = issues.filter(issue => issue.status !== 'resolved').slice(0, 4);
  const busiestRoutes = deliveries
    .slice()
    .sort((a, b) => (b.distance || 0) - (a.distance || 0))
    .slice(0, 3);
  const kpiTrend = analyticsData.deliveriesOverTime.slice(-7);
  const maxTrend = Math.max(...kpiTrend.map(item => item.deliveries), 1);

  if (loading) {
    return (
      <div className="dashboard-page">
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
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Dashboard</h1>
          <p className="page-subtitle">Monitor and manage all delivery operations</p>
        </div>
        <div className="page-meta">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="stats-grid">
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
      <div className="content-grid full-width">
        {/* Active Deliveries Map */}
        <div className="content-card map-card">
          <div className="card-header">
            <h3 className="card-title">Live Delivery Map</h3>
            <span className="badge badge-success">{activeDeliveries} Active</span>
          </div>
          <div className="card-body">
            <div className="map-placeholder">
              <div className="map-overlay">
                <FiTruck size={48} />
                <p>Interactive Map View</p>
                <span className="map-info">{activeDriversCount} drivers online • {activeDeliveries} deliveries in progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="content-card quick-actions-card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div className="card-body">
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
      </div>

      {/* Delivery Status Overview */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Today's Deliveries Overview</h3>
        </div>
        <div className="card-body">
          <div className="delivery-stats">
            <div className="stat-item">
              <div className="stat-icon success">
                <FiCheckCircle size={18} />
              </div>
              <div className="stat-content">
                <h4>Completed</h4>
                <p className="stat-value">{stats.completedDeliveries}</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon info">
                <FiTruck size={18} />
              </div>
              <div className="stat-content">
                <h4>In Transit</h4>
                <p className="stat-value">{stats.inTransitDeliveries}</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon warning">
                <FiClock size={18} />
              </div>
              <div className="stat-content">
                <h4>Pending</h4>
                <p className="stat-value">{stats.pendingDeliveries}</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon danger">
                <FiAlertCircle size={18} />
              </div>
              <div className="stat-content">
                <h4>Failed</h4>
                <p className="stat-value">{stats.failedDeliveries}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Queue + Availability */}

      <div className="masonry-grid">
        {/* Late Alerts */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Late Delivery Alerts</h3>
            <FiAlertTriangle size={18} className="card-icon" />
          </div>
          <div className="card-body">
            {lateAlerts.length === 0 ? (
              <div className="empty-state-inline">No late deliveries</div>
            ) : (
              <div className="list">
                {lateAlerts.map(delivery => (
                  <div key={delivery.id} className="list-row">
                    <div>
                      <div className="list-title">{delivery.orderNumber}</div>
                      <div className="list-sub">Driver: {delivery.driver} • {delivery.boutique}</div>
                    </div>
                    <div className="list-meta">
                      <span className="pill pill-warning">ETA {new Date(delivery.estimatedDelivery).toLocaleTimeString()}</span>
                      <span className="pill pill-muted">{delivery.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Drivers */}
        <div className="content-card masonry-span">
          <div className="card-header">
            <h3 className="card-title">Top Driver Performance</h3>
            <FiTrendingUp size={18} className="card-icon" />
          </div>
          <div className="card-body">
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Deliveries</th>
                  <th>Rating</th>
                  <th>On-Time</th>
                </tr>
              </thead>
              <tbody>
                {topDrivers.map(driver => (
                  <tr key={driver.driver}>
                    <td>{driver.driver}</td>
                    <td>{driver.deliveries}</td>
                    <td>{driver.rating}</td>
                    <td>{driver.onTimeRate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Today's Payouts */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Today's Payouts</h3>
            <FiDollarSign size={18} className="card-icon" />
          </div>
          <div className="card-body">
            <div className="summary-grid">
              <div className="summary-item">
                <span>Pending</span>
                <strong>{earnings.pendingPayouts} MAD</strong>
              </div>
              <div className="summary-item">
                <span>Paid</span>
                <strong>{earnings.paidThisMonth} MAD</strong>
              </div>
            </div>
            <div className="list compact">
              {earnings.driverEarnings.slice(0, 4).map(driver => (
                <div key={driver.driver} className="list-row">
                  <div className="list-title">{driver.driver}</div>
                  <div className="list-meta">
                    <span className="pill pill-muted">Pending {driver.pending} MAD</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Active Incidents */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Active Incidents</h3>
            <FiAlertCircle size={18} className="card-icon" />
          </div>
          <div className="card-body">
            {openIncidents.length === 0 ? (
              <div className="empty-state-inline">No active incidents</div>
            ) : (
              <div className="list compact">
                {openIncidents.map(issue => (
                  <div key={issue.id} className="list-row">
                    <div>
                      <div className="list-title">{issue.deliveryId} • {issue.type.replace('_', ' ')}</div>
                      <div className="list-sub">{issue.description}</div>
                    </div>
                    <div className="list-meta">
                      <span className={`pill ${issue.priority === 'high' ? 'pill-danger' : 'pill-warning'}`}>
                        {issue.priority}
                      </span>
                      <span className="pill pill-muted">{issue.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Busiest Routes */}
        <div className="content-card">
          <div className="card-header">
            <h3 className="card-title">Busiest Routes</h3>
            <FiMapPin size={18} className="card-icon" />
          </div>
          <div className="card-body">
            <div className="list compact">
              {busiestRoutes.map(route => (
                <div key={route.id} className="list-row">
                  <div>
                    <div className="list-title">{route.boutique} to {route.customer}</div>
                    <div className="list-sub">{route.distance} km • {route.orderNumber}</div>
                  </div>
                  <div className="list-meta">
                    <span className="pill pill-warning">Traffic Risk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    
    </div>
  );
};

export default DashboardHome;
