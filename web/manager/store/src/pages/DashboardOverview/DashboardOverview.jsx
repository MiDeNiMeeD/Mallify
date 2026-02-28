import React, { useEffect, useState } from 'react';
import { FiShoppingBag, FiCheckCircle, FiClock, FiDollarSign, FiShoppingCart, FiPackage } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const DashboardOverview = () => {
  const [stats, setStats] = useState({
    totalBoutiques: 0,
    activeBoutiques: 0,
    pendingApprovals: 0,
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
  });
  const [recentBoutiques, setRecentBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const boutiquesResponse = await apiClient.getBoutiques({ limit: 100 });
      const boutiques = boutiquesResponse.data?.boutiques || [];
      
      const activeBoutiques = boutiques.filter(b => b.status === 'active').length;
      const pendingBoutiques = boutiques.filter(b => b.status === 'pending').length;
      const totalSales = boutiques.reduce((sum, b) => sum + (b.totalSales || 0), 0);
      const totalOrders = boutiques.reduce((sum, b) => sum + (b.totalOrders || 0), 0);
      
      setStats({
        totalBoutiques: boutiques.length,
        activeBoutiques,
        pendingApprovals: pendingBoutiques,
        totalSales,
        totalOrders,
        totalProducts: boutiques.reduce((sum, b) => sum + (b.productCount || 0), 0),
      });

      setRecentBoutiques(boutiques.slice(0, 5));
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Monitor platform performance and manage boutiques</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Boutiques</span>
            <div className="stat-icon pink">
              <FiShoppingBag />
            </div>
          </div>
          <div className="stat-value">{stats.totalBoutiques}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active Boutiques</span>
            <div className="stat-icon success">
              <FiCheckCircle />
            </div>
          </div>
          <div className="stat-value">{stats.activeBoutiques}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending Approvals</span>
            <div className="stat-icon warning">
              <FiClock />
            </div>
          </div>
          <div className="stat-value">{stats.pendingApprovals}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Platform Sales</span>
            <div className="stat-icon success">
              <FiDollarSign />
            </div>
          </div>
          <div className="stat-value">{formatCurrency(stats.totalSales)}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Orders</span>
            <div className="stat-icon info">
              <FiShoppingCart />
            </div>
          </div>
          <div className="stat-value">{stats.totalOrders}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Products</span>
            <div className="stat-icon warning">
              <FiPackage />
            </div>
          </div>
          <div className="stat-value">{stats.totalProducts}</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Recent Boutiques</h3>
        </div>
        <div className="card-body">
          {recentBoutiques.length === 0 ? (
            <div className="empty-state">
              <FiShoppingBag className="empty-state-icon" />
              <div className="empty-state-title">No boutiques yet</div>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Boutique</th>
                  <th>Status</th>
                  <th>Products</th>
                  <th>Total Sales</th>
                  <th>Orders</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {recentBoutiques.map((boutique) => (
                  <tr key={boutique._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {boutique.logo && (
                          <img 
                            src={boutique.logo} 
                            alt="" 
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '8px', 
                              objectFit: 'cover' 
                            }} 
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{boutique.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {boutique.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-badge ${boutique.status}`}>
                        {boutique.status}
                      </span>
                    </td>
                    <td>{boutique.productCount || 0}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(boutique.totalSales || 0)}</td>
                    <td>{boutique.totalOrders || 0}</td>
                    <td>{new Date(boutique.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
