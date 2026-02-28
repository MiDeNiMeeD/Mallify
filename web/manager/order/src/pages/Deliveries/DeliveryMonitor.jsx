import React, { useState, useEffect } from 'react';
import { FiTruck, FiMapPin, FiClock, FiUser, FiPackage, FiPhone } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const DeliveryMonitor = () => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDeliveries({ limit: 100 });
      setDeliveries(response.data?.deliveries || []);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeliveries = statusFilter === 'all' 
    ? deliveries 
    : deliveries.filter(d => d.status === statusFilter);

  const stats = [
    { label: 'Total Deliveries', value: deliveries.length, icon: FiTruck, color: 'orange' },
    { label: 'In Transit', value: deliveries.filter(d => d.status === 'in_transit').length, icon: FiMapPin, color: 'info' },
    { label: 'Pending', value: deliveries.filter(d => d.status === 'pending').length, icon: FiClock, color: 'warning' },
    { label: 'Delivered Today', value: deliveries.filter(d => d.status === 'delivered').length, icon: FiPackage, color: 'success' }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading deliveries...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Delivery Monitor</h1>
          <p className="page-subtitle">Real-time monitoring of all active deliveries</p>
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

      {/* Filters */}
      <div className="tabs">
        <div className={`tab ${statusFilter === 'all' ? 'active' : ''}`} onClick={() => setStatusFilter('all')}>
          All Deliveries
        </div>
        <div className={`tab ${statusFilter === 'pending' ? 'active' : ''}`} onClick={() => setStatusFilter('pending')}>
          Pending
        </div>
        <div className={`tab ${statusFilter === 'in_transit' ? 'active' : ''}`} onClick={() => setStatusFilter('in_transit')}>
          In Transit
        </div>
        <div className={`tab ${statusFilter === 'delivered' ? 'active' : ''}`} onClick={() => setStatusFilter('delivered')}>
          Delivered
        </div>
        <div className={`tab ${statusFilter === 'failed' ? 'active' : ''}`} onClick={() => setStatusFilter('failed')}>
          Failed
        </div>
      </div>

      {/* Delivery Cards */}
      <div className="grid-2">
        {filteredDeliveries.map((delivery) => (
          <div key={delivery._id} className="content-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">{delivery.trackingNumber || delivery._id}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Order: {delivery.orderId?.orderNumber || delivery.orderId || 'N/A'}
                </p>
              </div>
              <span className={`status-badge ${delivery.status}`}>
                {delivery.status.replace('_', ' ')}
              </span>
            </div>
            <div className="card-body">
              {/* Driver */}
              <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Driver</div>
                <div style={{ fontWeight: 600 }}>{delivery.driverId?.name || 'Unassigned'}</div>
              </div>

              {/* Customer */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <FiUser size={16} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{delivery.recipientName || 'Customer'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <FiPhone size={14} color="var(--text-secondary)" />
                  <span style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>{delivery.recipientPhone || 'N/A'}</span>
                </div>
              </div>

              {/* Locations */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', background: 'var(--info-light)', borderRadius: '8px', marginBottom: '0.5rem' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--info-color)', marginBottom: '0.25rem' }}>Pickup</div>
                  <div style={{ fontSize: '0.813rem', fontWeight: 500 }}>{delivery.pickupAddress?.full || delivery.pickupAddress || 'N/A'}</div>
                </div>
                <div style={{ padding: '0.75rem', background: 'var(--success-light)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--success-color)', marginBottom: '0.25rem' }}>Delivery</div>
                  <div style={{ fontSize: '0.813rem', fontWeight: 500 }}>{delivery.deliveryAddress?.full || delivery.deliveryAddress || 'N/A'}</div>
                </div>
              </div>

              {/* Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Distance</div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{delivery.distance || 0} km</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Fee</div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>${delivery.fee || 0}</div>
                </div>
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Priority</div>
                  <span className={`status-badge ${delivery.priority || 'normal'}`}>{delivery.priority || 'normal'}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <div className="content-card">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiTruck />
            </div>
            <div className="empty-state-title">No deliveries found</div>
            <p>No deliveries in this category</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeliveryMonitor;
