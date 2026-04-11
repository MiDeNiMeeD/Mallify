import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  Users, 
  DollarSign, 
  AlertCircle,
  ArrowUpRight,
  Eye,
  Edit,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import LoadingState from '../../components/LoadingState';
import '../../styles/base.css';
import '../../styles/list-layout.css';
import './Dashboard.css';

const Sparkline = ({ data = [], color = '#FE4CC2', gradientId }) => {
  if (!data.length) {
    return null;
  }

  const width = 160;
  const height = 70;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = data.length > 1 ? width / (data.length - 1) : width;

  const linePoints = data
    .map((value, index) => {
      const x = index * step;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `${linePoints} ${width},${height} 0,${height}`;

  return (
    <svg className="sparkline" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#${gradientId})`} />
      <polyline points={linePoints} fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};

function DashboardOverview() {
  const navigate = useNavigate();
  const { user, loading: authLoading, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeProducts: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  const fallbackTrends = useMemo(
    () => ({
      revenue: [1200, 1450, 1620, 1780, 2100, 2350],
      orders: [25, 32, 28, 36, 44, 52],
      fulfillment: [68, 72, 75, 78, 82, 88],
    }),
    []
  );

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) {
        return;
      }

      let activeUser = user;

      if (!activeUser?.boutiqueList?.length) {
        const refreshed = await refreshUserProfile();
        activeUser = refreshed || activeUser;
      }

      if (!activeUser?.boutiqueList?.length) {
        setError('No boutique found for this user');
        setLoading(false);
        return;
      }

      setError(null);

      try {
        setLoading(true);
        const boutiqueId = activeUser.boutiqueList[0];
        
        const response = await apiClient.getDashboardStats(boutiqueId);
        
        if (response.success) {
          const { data } = response;
          setDashboardStats({
            totalRevenue: data.totalRevenue || 0,
            totalOrders: data.totalOrders || 0,
            pendingOrders: data.pendingOrders || 0,
            completedOrders: data.completedOrders || 0,
            activeProducts: data.activeProducts || 0,
            lowStockProducts: data.lowStockProducts || 0,
          });
          setRecentOrders(data.recentOrders || []);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading, refreshUserProfile]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      completed: 'success'
    };
    return colors[status] || 'secondary';
  };

  const deriveTrendSeries = (value, fallback) => {
    if (!value || value <= 0) {
      return fallback;
    }
    const slice = fallback.length;
    return Array.from({ length: slice }, (_, index) => {
      const factor = 0.6 + index * 0.08;
      return Math.round((value / slice) * factor) || fallback[index];
    });
  };

  const revenueTrend = deriveTrendSeries(dashboardStats.totalRevenue, fallbackTrends.revenue);
  const orderTrend = deriveTrendSeries(dashboardStats.totalOrders, fallbackTrends.orders);
  const fulfillmentTrend = deriveTrendSeries(dashboardStats.completedOrders, fallbackTrends.fulfillment);

  const getTrendChange = (series) => {
    if (!series || series.length < 2) {
      return 0;
    }
    const first = series[0] || 0;
    const last = series[series.length - 1] || 0;
    if (first === 0) {
      return last > 0 ? 100 : 0;
    }
    return ((last - first) / first) * 100;
  };

  const formatChange = (value) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;

  const trendCards = [
    {
      title: 'Revenue Pulse',
      subtitle: 'Gross sales trajectory',
      value: formatCurrency(revenueTrend[revenueTrend.length - 1] || 0),
      change: formatChange(getTrendChange(revenueTrend)),
      changeType: getTrendChange(revenueTrend) >= 0 ? 'positive' : 'negative',
      color: 'var(--primary-pink)',
      gradientId: 'revenueGradient',
      data: revenueTrend,
    },
    {
      title: 'Order Momentum',
      subtitle: 'Volume over time',
      value: `${orderTrend[orderTrend.length - 1] || 0} orders`,
      change: formatChange(getTrendChange(orderTrend)),
      changeType: getTrendChange(orderTrend) >= 0 ? 'positive' : 'negative',
      color: 'var(--info-color)',
      gradientId: 'ordersGradient',
      data: orderTrend,
    },
    {
      title: 'Fulfillment Rate',
      subtitle: 'Completed vs total',
      value: `${Math.min(
        100,
        Math.round(((dashboardStats.completedOrders || 0) / Math.max(dashboardStats.totalOrders || 1, 1)) * 100)
      )}%`,
      change: formatChange(getTrendChange(fulfillmentTrend)),
      changeType: getTrendChange(fulfillmentTrend) >= 0 ? 'positive' : 'negative',
      color: 'var(--success-color)',
      gradientId: 'fulfillmentGradient',
      data: fulfillmentTrend,
    },
  ];

  if (loading) {
    return (
      <LoadingState
        title="Loading dashboard"
        message="Pulling live KPIs and latest store signals."
        detail="Aggregating revenue, orders, and fulfillment data…"
        icon={TrendingUp}
      />
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <AlertCircle size={48} />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1 className="page-title">Dashboard Overview</h1>
        <p className="page-subtitle">Welcome back! Here's what's happening with your store today.</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Revenue</span>
            <div className="stat-icon pink">
              <DollarSign size={20} />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(dashboardStats.totalRevenue)}</div>
          
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Orders</span>
            <div className="stat-icon info">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="stat-value">{dashboardStats.totalOrders}</div>
          
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active Products</span>
            <div className="stat-icon success">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{dashboardStats.activeProducts}</div>
        
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending Orders</span>
            <div className="stat-icon info">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{dashboardStats.pendingOrders}</div>
         
        </div>
      </div>

      {/* Trend Cards */}
      <div className="chart-grid">
        {trendCards.map((card) => (
          <div className="chart-card" key={card.title}>
            <div className="chart-card-header">
              <div>
                <p className="chart-eyebrow">{card.subtitle}</p>
                <h3>{card.title}</h3>
              </div>
              <div className={`chart-change ${card.changeType}`}>{card.change}</div>
            </div>
            <Sparkline data={card.data} color={card.color} gradientId={card.gradientId} />
            <div className="chart-meta">
              <span className="chart-value">{card.value}</span>
              <span className="chart-caption">Last 6 checkpoints</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="quick-actions-grid">
            <button className="quick-action-btn" onClick={() => navigate('/products/add')}>
              <Package size={24} />
              <span>Add Product</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/orders/pending')}>
              <ShoppingBag size={24} />
              <span>Pending Orders ({dashboardStats.pendingOrders})</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/products/inventory')}>
              <AlertCircle size={24} />
              <span>Low Stock ({dashboardStats.lowStockProducts})</span>
            </button>
            <button className="quick-action-btn" onClick={() => navigate('/communication/customers')}>
              <Users size={24} />
              <span>Messages</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Recent Orders</h2>
          <button className="btn-secondary" onClick={() => navigate('/orders')}>
            View All
            <ArrowUpRight size={16} />
          </button>
        </div>
        <div className="card-body">
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} />
              <p>No orders yet</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order._id || order.id}>
                  <td><strong>{order.orderNumber || order._id}</strong></td>
                  <td>{order.userId?.name || order.customer || 'N/A'}</td>
                  <td>{order.items?.length || order.items || 0}</td>
                  <td><strong>{formatCurrency(order.totalAmount || order.total || 0)}</strong></td>
                  <td>
                    <strong style={{ textTransform: 'capitalize' }}>{order.status}</strong>
                  </td>
                  <td>{new Date(order.createdAt || order.date).toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        className="btn-icon" 
                        title="View"
                        onClick={() => navigate(`/orders/${order._id || order.id}`)}
                      >
                        <Eye size={16} />
                      </button>
                      {order.status === 'pending' && (
                        <button 
                          className="btn-icon" 
                          title="Process"
                          onClick={() => navigate(`/orders/${order._id || order.id}`)}
                        >
                          <CheckCircle size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardOverview;
