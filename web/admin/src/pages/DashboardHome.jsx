import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiShoppingBag, 
  FiPackage, 
  FiDollarSign,
  FiActivity,
  FiAlertCircle,
  FiTrendingUp,
  FiBarChart2,
  FiCreditCard
} from 'react-icons/fi';
import {
  Line,
  Bar,
  Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import './DashboardHome.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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
      icon: FiUsers,
      iconBg: 'rgba(59, 130, 246, 0.15)',
      iconColor: '#2563EB',
      growth: stats.userGrowth,
      growthLabel: 'vs last month'
    },
    {
      title: 'Active Boutiques',
      value: stats.totalBoutiques.toLocaleString(),
      icon: FiShoppingBag,
      iconBg: 'rgba(16, 185, 129, 0.15)',
      iconColor: '#059669',
      growth: stats.boutiqueGrowth,
      growthLabel: 'vs last month'
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders.toLocaleString(),
      icon: FiPackage,
      iconBg: 'rgba(96, 165, 250, 0.15)',
      iconColor: '#3B82F6',
      growth: stats.orderGrowth,
      growthLabel: 'vs last month'
    },
    {
      title: 'Total Revenue',
      value: `$${(stats.totalRevenue / 1000).toFixed(1)}K`,
      icon: FiDollarSign,
      iconBg: 'rgba(245, 158, 11, 0.15)',
      iconColor: '#D97706',
      growth: stats.revenueGrowth,
      growthLabel: 'vs last month'
    }
  ];

  const recentActivities = [
    { id: 1, type: 'user', message: 'New user registered: John Smith', time: '2 min ago', icon: FiUsers },
    { id: 2, type: 'boutique', message: 'Boutique approved: Fashion Hub', time: '15 min ago', icon: FiShoppingBag },
    { id: 3, type: 'order', message: 'High-value order placed: $1,250', time: '32 min ago', icon: FiPackage },
    { id: 4, type: 'alert', message: 'Payment dispute reported', time: '1 hour ago', icon: FiAlertCircle },
    { id: 5, type: 'user', message: 'New driver application received', time: '2 hours ago', icon: FiUsers }
  ];

  // Chart data - Revenue Trend (Last 12 months)
  const revenueChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Revenue',
        data: [180, 220, 195, 280, 310, 290, 350, 380, 420, 450, 480, 520],
        borderColor: '#D97706',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#D97706',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Chart data - User Growth (Last 12 months)
  const userGrowthChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'New Users',
        data: [1200, 1450, 1380, 1620, 1850, 1720, 2100, 2350, 2480, 2650, 2820, 3100],
        borderColor: '#2563EB',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#2563EB',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }
    ]
  };

  // Chart data - Order Volume (Last 12 months)
  const orderVolumeChartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Orders',
        data: [850, 920, 1100, 1050, 1280, 1350, 1420, 1580, 1650, 1720, 1890, 2050],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(59, 130, 246, 0.6)',
          'rgba(59, 130, 246, 0.75)',
          'rgba(59, 130, 246, 0.85)',
          'rgba(59, 130, 246, 0.7)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(59, 130, 246, 0.85)',
          'rgba(59, 130, 246, 0.75)',
          'rgba(59, 130, 246, 0.9)',
          'rgba(59, 130, 246, 0.95)'
        ],
        borderColor: '#3B82F6',
        borderWidth: 1,
        borderRadius: 4
      }
    ]
  };

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context) {
            return '$' + context.parsed.y + 'K';
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
      y: {
        grid: {
          color: '#F3F4F6',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: '500'
          },
          callback: function(value) {
            return '$' + value + 'K';
          }
        },
        beginAtZero: true
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#F9FAFB',
        bodyColor: '#F9FAFB',
        padding: 12,
        displayColors: false
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: '500'
          }
        }
      },
      y: {
        grid: {
          color: '#F3F4F6',
          drawBorder: false
        },
        ticks: {
          color: '#6B7280',
          font: {
            size: 11,
            weight: '500'
          }
        },
        beginAtZero: true
      }
    }
  };

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
          <div key={index} className="admin-stat-card">
            <div className="admin-stat-header">
              <span className="admin-stat-title">{stat.title}</span>
              <div className="admin-stat-icon" style={{ background: stat.iconBg, color: stat.iconColor }}>
                <stat.icon size={22} />
              </div>
            </div>
            <div className="admin-stat-body">
              <div className="admin-stat-value">{stat.value}</div>
              <div className={`admin-stat-change ${stat.growth >= 0 ? 'positive' : 'negative'}`}>
                {stat.growth >= 0 ? '↑' : '↓'} {Math.abs(stat.growth)}% {stat.growthLabel}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="admin-charts-section">
        <div className="admin-charts-grid">
          {/* Revenue Trend Chart */}
          <div className="admin-card admin-chart-card">
            <div className="admin-card-header">
              <div className="admin-chart-header">
                <div className="admin-chart-title-wrapper">
                  <div className="admin-chart-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
                    <FiTrendingUp size={18} />
                  </div>
                  <h2>Revenue Trend</h2>
                </div>
                <span className="admin-chart-period">Last 12 months</span>
              </div>
              <button className="admin-btn-text">View Details</button>
            </div>
            <div className="admin-chart-container">
              <Line data={revenueChartData} options={lineChartOptions} height={280} />
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="admin-card admin-chart-card">
            <div className="admin-card-header">
              <div className="admin-chart-header">
                <div className="admin-chart-title-wrapper">
                  <div className="admin-chart-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}>
                    <FiUsers size={18} />
                  </div>
                  <h2>User Growth</h2>
                </div>
                <span className="admin-chart-period">Last 12 months</span>
              </div>
              <button className="admin-btn-text">View Details</button>
            </div>
            <div className="admin-chart-container">
              <Line data={userGrowthChartData} options={lineChartOptions} height={280} />
            </div>
          </div>
        </div>
      </div>

      {/* Content Grid - Masonry Layout */}
      <div className="admin-masonry-grid">
        {/* Recent Activities - Left Side */}
        <div className="admin-masonry-left">
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
        </div>

        {/* Right Side - Quick Actions and System Status stacked */}
        <div className="admin-masonry-right">
          {/* Quick Actions */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="admin-quick-actions">
              <button className="admin-action-card">
                <div className="admin-action-icon-wrapper" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED' }}>
                  <FiUsers size={22} />
                </div>
                <span className="admin-action-label">Manage Users</span>
              </button>
              <button className="admin-action-card">
                <div className="admin-action-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                  <FiShoppingBag size={22} />
                </div>
                <span className="admin-action-label">Approve Boutiques</span>
              </button>
              <button className="admin-action-card">
                <div className="admin-action-icon-wrapper" style={{ background: 'rgba(96, 165, 250, 0.15)', color: '#3B82F6' }}>
                  <FiPackage size={22} />
                </div>
                <span className="admin-action-label">View Orders</span>
              </button>
              <button className="admin-action-card">
                <div className="admin-action-icon-wrapper" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
                  <FiDollarSign size={22} />
                </div>
                <span className="admin-action-label">Payments</span>
              </button>
            </div>
          </div>

          {/* System Status */}
          <div className="admin-system-status">
            <h2>System Status</h2>
            <div className="admin-status-grid">
              <div className="admin-status-card">
                <div className="admin-status-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#2563EB' }}>
                  <div className="admin-status-dot active"></div>
                </div>
                <div className="admin-status-info">
                  <div className="admin-status-title">API Gateway</div>
                  <div className="admin-status-value">Operational</div>
                </div>
              </div>
              <div className="admin-status-card">
                <div className="admin-status-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#059669' }}>
                  <div className="admin-status-dot active"></div>
                </div>
                <div className="admin-status-info">
                  <div className="admin-status-title">Database</div>
                  <div className="admin-status-value">Healthy</div>
                </div>
              </div>
              <div className="admin-status-card">
                <div className="admin-status-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#D97706' }}>
                  <div className="admin-status-dot active"></div>
                </div>
                <div className="admin-status-info">
                  <div className="admin-status-title">Payment Service</div>
                  <div className="admin-status-value">Online</div>
                </div>
              </div>
              <div className="admin-status-card">
                <div className="admin-status-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7C3AED' }}>
                  <div className="admin-status-dot active"></div>
                </div>
                <div className="admin-status-info">
                  <div className="admin-status-title">Notification Service</div>
                  <div className="admin-status-value">Running</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
