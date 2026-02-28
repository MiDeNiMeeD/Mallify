import React from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar } from 'lucide-react';
import { analyticsData, topProducts, ordersByStatus } from '../../data/mockData';
import '../Dashboard/Dashboard.css';

function SalesAnalytics() {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const totalRevenue = analyticsData.reduce((sum, month) => sum + month.revenue, 0);
  const totalOrders = analyticsData.reduce((sum, month) => sum + month.orders, 0);
  const avgOrderValue = totalRevenue / totalOrders;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Analytics</h1>
          <p className="page-subtitle">Track your sales performance and trends</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <select className="form-input" style={{ width: 'auto' }}>
            <option>Last 6 Months</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Revenue</span>
            <div className="stat-icon pink"><DollarSign size={20} /></div>
          </div>
          <div className="stat-value">{formatCurrency(totalRevenue)}</div>
          <div className="stat-trend positive">↑ 12.5%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Orders</span>
            <div className="stat-icon info"><ShoppingBag size={20} /></div>
          </div>
          <div className="stat-value">{totalOrders}</div>
          <div className="stat-trend positive">↑ 8.2%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Avg Order Value</span>
            <div className="stat-icon success"><TrendingUp size={20} /></div>
          </div>
          <div className="stat-value">{formatCurrency(avgOrderValue)}</div>
          <div className="stat-trend positive">↑ 3.8%</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Customers</span>
            <div className="stat-icon warning"><Users size={20} /></div>
          </div>
          <div className="stat-value">1,240</div>
          <div className="stat-trend positive">↑ 15.3%</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={20} />
            <h2 className="card-title">Sales by Month</h2>
          </div>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Revenue</th>
                <th>Orders</th>
                <th>Avg Order</th>
                <th>Growth</th>
              </tr>
            </thead>
            <tbody>
              {analyticsData.map((month) => (
                <tr key={month.month}>
                  <td><strong>{month.month}</strong></td>
                  <td>{formatCurrency(month.revenue)}</td>
                  <td>{month.orders}</td>
                  <td>{formatCurrency(month.revenue / month.orders)}</td>
                  <td>
                    <span className={`stat-trend positive`}>
                      ↑ 5%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
                  <th>Revenue</th>
                  <th>Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((product, idx) => (
                  <tr key={idx}>
                    <td>{product.name}</td>
                    <td><strong>{formatCurrency(product.revenue)}</strong></td>
                    <td>{product.sales}</td>
                  </tr>
                ))}
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
              {ordersByStatus.map((status) => (
                <div key={status.status}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="status-badge" style={{ textTransform: 'capitalize' }}>{status.status}</span>
                    <strong>{status.count} orders</strong>
                  </div>
                  <div style={{ 
                    width: '100%', 
                    height: '8px', 
                    backgroundColor: 'var(--light-bg)', 
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${(status.count / totalOrders) * 100}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary-color)',
                      borderRadius: '4px'
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SalesAnalytics;
