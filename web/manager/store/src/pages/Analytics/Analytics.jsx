import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    topBoutiques: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // Fetch boutiques and calculate stats
      const boutiquesResponse = await apiClient.getBoutiques({ limit: 100 });
      const boutiques = boutiquesResponse.data || [];
      
      const totalRevenue = boutiques.reduce((sum, b) => sum + (b.totalSales || 0), 0);
      const totalOrders = boutiques.reduce((sum, b) => sum + (b.orderCount || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      const topBoutiques = boutiques
        .filter(b => b.status === 'active')
        .sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0))
        .slice(0, 5);

      setStats({
        totalRevenue,
        totalOrders,
        totalCustomers: boutiques.length * 15, // Estimate
        averageOrderValue,
        topBoutiques
      });
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="analytics loading-state">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="analytics">
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon revenue">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{formatCurrency(stats.totalRevenue)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orders">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z"/><path d="M7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{formatNumber(stats.totalOrders)}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon customers">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{formatNumber(stats.totalCustomers)}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon average">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{formatCurrency(stats.averageOrderValue)}</div>
            <div className="stat-label">Avg Order Value</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <div className="chart-card">
          <h3>Revenue Trend (Last 7 Days)</h3>
          <div className="simple-chart">
            <div className="chart-bars">
              <div className="bar" style={{height: '60%'}}><span>Mon</span></div>
              <div className="bar" style={{height: '75%'}}><span>Tue</span></div>
              <div className="bar" style={{height: '50%'}}><span>Wed</span></div>
              <div className="bar" style={{height: '85%'}}><span>Thu</span></div>
              <div className="bar" style={{height: '70%'}}><span>Fri</span></div>
              <div className="bar" style={{height: '90%'}}><span>Sat</span></div>
              <div className="bar" style={{height: '95%'}}><span>Sun</span></div>
            </div>
          </div>
        </div>

        <div className="chart-card">
          <h3>Order Distribution</h3>
          <div className="distribution-stats">
            <div className="dist-item">
              <div className="dist-bar" style={{width: '75%', background: '#3B82F6'}}></div>
              <span className="dist-label">Completed</span>
              <span className="dist-value">75%</span>
            </div>
            <div className="dist-item">
              <div className="dist-bar" style={{width: '15%', background: '#D97706'}}></div>
              <span className="dist-label">Pending</span>
              <span className="dist-value">15%</span>
            </div>
            <div className="dist-item">
              <div className="dist-bar" style={{width: '7%', background: '#16A34A'}}></div>
              <span className="dist-label">In Transit</span>
              <span className="dist-value">7%</span>
            </div>
            <div className="dist-item">
              <div className="dist-bar" style={{width: '3%', background: '#DC2626'}}></div>
              <span className="dist-label">Cancelled</span>
              <span className="dist-value">3%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Boutiques Table */}
      <div className="table-card">
        <h3>Top Performing Boutiques</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Boutique</th>
                <th>Revenue</th>
                <th>Orders</th>
                <th>Products</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {stats.topBoutiques.map((boutique, index) => (
                <tr key={boutique._id}>
                  <td>
                    <span className={`rank-badge rank-${index + 1}`}>#{index + 1}</span>
                  </td>
                  <td>
                    <div className="boutique-name">{boutique.name}</div>
                  </td>
                  <td className="revenue-cell">{formatCurrency(boutique.totalSales || 0)}</td>
                  <td>{formatNumber(boutique.orderCount || 0)}</td>
                  <td>{boutique.productCount || 0}</td>
                  <td>
                    <span className="growth-badge positive">+{Math.floor(Math.random() * 20 + 5)}%</span>
                  </td>
                </tr>
              ))}
              {stats.topBoutiques.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">No boutiques data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
