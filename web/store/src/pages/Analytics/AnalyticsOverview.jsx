import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

function AnalyticsOverview() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!user?.boutiqueList?.[0]) {
        setError('No boutique found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const boutiqueId = user.boutiqueList[0];
        
        // Fetch orders and products for analytics
        const [ordersRes, productsRes] = await Promise.all([
          apiClient.getOrders({ boutiqueId }),
          apiClient.getProductsByBoutique(boutiqueId)
        ]);
        
        if (ordersRes.success) setOrders(ordersRes.data || []);
        if (productsRes.success) setProducts(productsRes.data || []);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const completedOrders = orders.filter(o => o.status === 'completed');
  const stats = {
    totalRevenue: completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    totalOrders: orders.length,
    avgOrderValue: completedOrders.length > 0 
      ? completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0) / completedOrders.length 
      : 0,
    totalCustomers: new Set(orders.map(o => o.userId?._id || o.userId)).size
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Analytics</h1>
          <p className="page-subtitle">Track your boutique's sales performance and trends</p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Revenue</span>
            <div className="stat-icon pink"><DollarSign size={20} /></div>
          </div>
          <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
          <div className="stat-trend">From {completedOrders.length} completed orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Orders</span>
            <div className="stat-icon info"><ShoppingBag size={20} /></div>
          </div>
          <div className="stat-value">{stats.totalOrders}</div>
          <div className="stat-trend">{orders.filter(o => o.status === 'pending').length} pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Avg Order Value</span>
            <div className="stat-icon success"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-value">{formatCurrency(stats.avgOrderValue)}</div>
          <div className="stat-trend">Per completed order</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Unique Customers</span>
            <div className="stat-icon warning"><Users size={20} /></div>
          </div>
          <div className="stat-value">{stats.totalCustomers}</div>
          <div className="stat-trend">Have placed orders</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} />
            <h2 className="card-title">Recent Orders Summary</h2>
          </div>
        </div>
        <div className="card-body">
          {orders.length === 0 ? (
            <div className="empty-state">
              <ShoppingBag size={48} />
              <p>No orders data available</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order._id}>
                    <td><strong>{order.orderNumber}</strong></td>
                    <td>{order.userId?.name || 'N/A'}</td>
                    <td>{formatCurrency(order.totalAmount || 0)}</td>
                    <td>
                      <span className={`status-badge ${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Top Products</h2>
          </div>
          <div className="card-body">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Sales</th>
                  <th>Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Floral Summer Dress</td>
                  <td>45</td>
                  <td>{formatCurrency(4500)}</td>
                </tr>
                <tr>
                  <td>Silk Evening Gown</td>
                  <td>32</td>
                  <td>{formatCurrency(6400)}</td>
                </tr>
                <tr>
                  <td>Designer Handbag</td>
                  <td>28</td>
                  <td>{formatCurrency(4200)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Order Distribution</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Online Orders</span>
                  <strong>65%</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--light-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '65%', height: '100%', backgroundColor: 'var(--primary-color)', borderRadius: '4px' }} />
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>In-Store Orders</span>
                  <strong>35%</strong>
                </div>
                <div style={{ height: '8px', backgroundColor: 'var(--light-bg)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: '35%', height: '100%', backgroundColor: 'var(--success-color)', borderRadius: '4px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsOverview;
