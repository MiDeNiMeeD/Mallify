import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiTrendingUp, FiCreditCard, FiUser } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const FinancialManagement = () => {
  const [driverEarnings, setDriverEarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const [driversRes, deliveriesRes] = await Promise.all([
        apiClient.getDrivers({ limit: 100 }),
        apiClient.getDeliveries({ limit: 1000 })
      ]);
      
      if (driversRes.success && deliveriesRes.success) {
        const drivers = driversRes.data?.drivers || [];
        const deliveries = deliveriesRes.data?.deliveries || [];
        
        const earnings = drivers.map(driver => {
          const driverDeliveries = deliveries.filter(
            d => d.driverId?._id === driver._id || d.driverId === driver._id
          );
          const completedDeliveries = driverDeliveries.filter(d => d.status === 'delivered');
          const totalEarned = completedDeliveries.reduce((acc, d) => acc + (d.fee || 0) * 0.7, 0); // 70% to driver
          const pendingPayout = 0; // All paid in this simplified version
          
          return {
            driver: driver.name,
            totalEarned: Math.round(totalEarned),
            completedDeliveries: completedDeliveries.length,
            pendingPayout
          };
        }).filter(e => e.totalEarned > 0);
        
        setDriverEarnings(earnings);
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const totalEarnings = driverEarnings.reduce((acc, d) => acc + d.totalEarned, 0);
  const pendingPayouts = driverEarnings.reduce((acc, d) => acc + d.pendingPayout, 0);

  const stats = [
    { label: 'Total Earnings', value: `$${totalEarnings.toLocaleString()}`, icon: FiDollarSign, color: 'success' },
    { label: 'Pending Payouts', value: `$${pendingPayouts.toLocaleString()}`, icon: FiCreditCard, color: 'warning' },
    { label: 'Monthly Growth', value: '+18.5%', icon: FiTrendingUp, color: 'info' },
    { label: 'Active Drivers', value: driverEarnings.length, icon: FiUser, color: 'orange' }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-spinner">Loading financial data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Management</h1>
          <p className="page-subtitle">Manage earnings, payouts, and financial records</p>
        </div>
        <button className="btn btn-primary">
          <FiCreditCard size={18} />
          Process Payouts
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-header">
              <span className="stat-label">{stat.label}</span>
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon />
              </div>
            </div>
            <div className="stat-value">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Driver Earnings */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Driver Earnings Breakdown</h3>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Total Earnings</th>
                <th>Completed Deliveries</th>
                <th>Avg per Delivery</th>
                <th>Pending Payout</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {driverEarnings.map((item, index) => (
                <tr key={index}>
                  <td style={{ fontWeight: 600 }}>{item.driver}</td>
                  <td>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '1rem',
                      background: 'linear-gradient(135deg, var(--primary-orange), var(--dark-orange))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>
                      ${item.totalEarned.toLocaleString()}
                    </span>
                  </td>
                  <td>{item.completedDeliveries}</td>
                  <td>${(item.totalEarned / item.completedDeliveries).toFixed(2)}</td>
                  <td style={{ fontWeight: 600 }}>${item.pendingPayout.toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${item.pendingPayout > 0 ? 'pending' : 'completed'}`}>
                      {item.pendingPayout > 0 ? 'Pending' : 'Paid'}
                    </span>
                  </td>
                  <td>
                    {item.pendingPayout > 0 && (
                      <button className="btn btn-success" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                        <FiCreditCard size={14} />
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;
