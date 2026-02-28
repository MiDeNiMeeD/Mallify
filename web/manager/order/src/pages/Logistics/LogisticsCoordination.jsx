import React, { useState, useEffect } from 'react';
import { FiPackage, FiShoppingBag, FiTruck, FiClock } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const LogisticsCoordination = () => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDeliveries({ limit: 1000 });
      if (response.success) {
        setDeliveries(response.data?.deliveries || []);
      }
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      setError('Failed to load deliveries');
    } finally {
      setLoading(false);
    }
  };

  const boutiques = [...new Set(deliveries.map(d => d.orderId?.boutiqueId?.name || d.boutique || 'Unknown Boutique'))];
  const stats = [
    { label: 'Active Boutiques', value: boutiques.length, icon: FiShoppingBag, color: 'orange' },
    { label: 'Pending Pickups', value: deliveries.filter(d => d.status === 'pending').length, icon: FiClock, color: 'warning' },
    { label: 'In Transit', value: deliveries.filter(d => d.status === 'in_transit').length, icon: FiTruck, color: 'info' },
    { label: 'Completed Today', value: deliveries.filter(d => d.status === 'delivered').length, icon: FiPackage, color: 'success' }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-spinner">Loading logistics data...</div>
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
          <h1 className="page-title">Logistics Coordination</h1>
          <p className="page-subtitle">Coordinate with boutiques and manage delivery operations</p>
        </div>
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

      {/* Boutique Activity */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Boutique Activity</h3>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Boutique Name</th>
                <th>Pending Orders</th>
                <th>In Transit</th>
                <th>Completed</th>
                <th>Total Revenue</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {boutiques.map((boutique, index) => {
                const boutiqueDeliveries = deliveries.filter(d => (d.orderId?.boutiqueId?.name || d.boutique) === boutique);
                const pending = boutiqueDeliveries.filter(d => d.status === 'pending').length;
                const inTransit = boutiqueDeliveries.filter(d => d.status === 'in_transit').length;
                const completed = boutiqueDeliveries.filter(d => d.status === 'delivered').length;
                const revenue = boutiqueDeliveries.reduce((acc, d) => acc + (d.fee || 0), 0);
                
                return (
                  <tr key={index}>
                    <td style={{ fontWeight: 600 }}>{boutique}</td>
                    <td>
                      <span className="status-badge pending">{pending}</span>
                    </td>
                    <td>
                      <span className="status-badge in_transit">{inTransit}</span>
                    </td>
                    <td>
                      <span className="status-badge completed">{completed}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>${revenue}</td>
                    <td>
                      <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                        View Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogisticsCoordination;
