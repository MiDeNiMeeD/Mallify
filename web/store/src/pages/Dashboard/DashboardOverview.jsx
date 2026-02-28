import React, { useState, useEffect } from 'react';
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
import './Dashboard.css';

function DashboardOverview() {
  const navigate = useNavigate();
  const { user } = useAuth();
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

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user || !user.boutiqueList || user.boutiqueList.length === 0) {
        setError('No boutique found for this user');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const boutiqueId = user.boutiqueList[0]; // Get first boutique
        
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
  }, [user]);

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

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
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
          <div className="stat-trend">
            <span>From {dashboardStats.completedOrders} completed orders</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Orders</span>
            <div className="stat-icon info">
              <ShoppingBag size={20} />
            </div>
          </div>
          <div className="stat-value">{dashboardStats.totalOrders}</div>
          <div className="stat-trend">
            <span>{dashboardStats.pendingOrders} pending</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active Products</span>
            <div className="stat-icon success">
              <Package size={20} />
            </div>
          </div>
          <div className="stat-value">{dashboardStats.activeProducts}</div>
          <div className="stat-trend warning">
            <AlertCircle size={16} />
            <span>{dashboardStats.lowStockProducts} low stock items</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending Orders</span>
            <div className="stat-icon info">
              <Users size={20} />
            </div>
          </div>
          <div className="stat-value">{dashboardStats.pendingOrders}</div>
          <div className="stat-trend">
            <span>Needs attention</span>
          </div>
        </div>
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
