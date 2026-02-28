import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiPackage, 
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity,
  FiAlertCircle
} from 'react-icons/fi';
import './DashboardHome.css';

const DashboardHome = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 24589,
    totalBoutiques: 1247,
    totalOrders: 15890,
    totalRevenue: 2847965,
    userGrowth: 12.5,
    boutiqueGrowth: 8.3,
    orderGrowth: 15.7,
    revenueGrowth: 18.2
  });

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      change: stats.userGrowth,
      icon: FiUsers,
      color: 'purple',
      bgGradient: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1) 0%, rgba(91, 33, 182, 0.1) 100%)',
      iconBg: 'linear-gradient(135deg, #7C3AED 0%, #5B21B6 100%)'
    },
    {
      title: 'Active Boutiques',
      value: stats.totalBoutiques.toLocaleString(),
      change: stats.boutiqueGrowth,
      icon: FiShoppingBag,
      color: 'blue',
      bgGradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.1) 100%)',
      iconBg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      change: stats.orderGrowth,
      icon: FiPackage,
      color: 'cyan',
      bgGradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(8, 145, 178, 0.1) 100%)',
      iconBg: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`,
      change: stats.revenueGrowth,
      icon: FiDollarSign,
      color: 'green',
      bgGradient: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 100%)',
      iconBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'user', message: 'New user registered: John Smith', time: '2 min ago', icon: FiUsers },
    { id: 2, type: 'boutique', message: 'Boutique approved: Fashion Hub', time: '15 min ago', icon: FiShoppingBag },
    { id: 3, type: 'order', message: 'High-value order placed: $1,250', time: '32 min ago', icon: FiPackage },
    { id: 4, type: 'alert', message: 'Payment dispute reported', time: '1 hour ago', icon: FiAlertCircle },
    { id: 5, type: 'user', message: 'New driver application received', time: '2 hours ago', icon: FiUsers }
  ];

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="admin-spinner-large"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-home">
      <div className="admin-dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening with your platform today.</p>
        </div>
        <button className="admin-btn-primary">
          <FiActivity size={18} />
          View Full Report
        </button>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {statCards.map((stat, index) => (
          <div key={index} className="admin-stat-card" style={{ background: stat.bgGradient }}>
            <div className="admin-stat-header">
              <div className="admin-stat-icon" style={{ background: stat.iconBg }}>
                <stat.icon size={24} />
              </div>
              <span className={`admin-stat-badge ${stat.change > 0 ? 'positive' : 'negative'}`}>
                {stat.change > 0 ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
                {Math.abs(stat.change)}%
              </span>
            </div>
            <div className="admin-stat-body">
              <h3>{stat.value}</h3>
              <p>{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Content Grid */}
      <div className="admin-content-grid">
        {/* Recent Activities */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Recent Activities</h2>
            <button className="admin-btn-text">View All</button>
          </div>
          <div className="admin-activity-list">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="admin-activity-item">
                <div className="admin-activity-icon">
                  <activity.icon size={18} />
                </div>
                <div className="admin-activity-content">
                  <p>{activity.message}</p>
                  <span>{activity.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2>Quick Actions</h2>
          </div>
          <div className="admin-quick-actions">
            <button className="admin-action-btn purple">
              <FiUsers size={24} />
              <span>Manage Users</span>
            </button>
            <button className="admin-action-btn blue">
              <FiShoppingBag size={24} />
              <span>Approve Boutiques</span>
            </button>
            <button className="admin-action-btn cyan">
              <FiPackage size={24} />
              <span>View Orders</span>
            </button>
            <button className="admin-action-btn green">
              <FiDollarSign size={24} />
              <span>Payments</span>
            </button>
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="admin-system-status">
        <h2>System Status</h2>
        <div className="admin-status-grid">
          <div className="admin-status-item">
            <div className="admin-status-indicator active"></div>
            <span>API Gateway</span>
            <span className="admin-status-value">Operational</span>
          </div>
          <div className="admin-status-item">
            <div className="admin-status-indicator active"></div>
            <span>Database</span>
            <span className="admin-status-value">Healthy</span>
          </div>
          <div className="admin-status-item">
            <div className="admin-status-indicator active"></div>
            <span>Payment Service</span>
            <span className="admin-status-value">Online</span>
          </div>
          <div className="admin-status-item">
            <div className="admin-status-indicator active"></div>
            <span>Notification Service</span>
            <span className="admin-status-value">Running</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
