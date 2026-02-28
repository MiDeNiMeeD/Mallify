import React, { useState, useEffect } from 'react';
import { FiNavigation, FiTruck } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const DeliveryTracking = () => {
  const [activeDeliveries, setActiveDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchActiveDeliveries();
  }, []);

  const fetchActiveDeliveries = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDeliveries({ limit: 100 });
      if (response.success) {
        const filtered = (response.data?.deliveries || []).filter(
          d => d.status === 'in_transit' || d.status === 'pending'
        );
        setActiveDeliveries(filtered);
      }
    } catch (error) {
      console.error('Error fetching active deliveries:', error);
      setError('Failed to load active deliveries');
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-spinner">Loading active deliveries...</div>
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
          <h1 className="page-title">Delivery Tracking</h1>
          <p className="page-subtitle">Track deliveries on map with live updates</p>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="content-card" style={{ marginBottom: '2rem' }}>
        <div style={{
          height: '500px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <FiMapPin size={64} />
          <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Interactive Map View</h3>
          <p style={{ fontSize: '1rem', opacity: 0.9 }}>{activeDeliveries.length} active deliveries being tracked</p>
        </div>
      </div>

      {/* Active Deliveries List */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Active Deliveries</h3>
          <span className="status-badge in_transit">{activeDeliveries.length} In Transit</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gap: '1rem' }}>
            {activeDeliveries.map((delivery) => (
              <div key={delivery.id} style={{
                padding: '1rem',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, rgba(254, 128, 1, 0.1), rgba(214, 130, 16, 0.1))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FiTruck size={24} color="var(--primary-orange)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>{delivery.id}</div>
                    <div style={{ fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
                      Driver: {delivery.driver}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Distance</div>
                    <div style={{ fontWeight: 600 }}>{delivery.distance} km</div>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: '0.813rem', padding: '0.5rem 1rem' }}>
                    <FiNavigation size={14} />
                    Track
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracking;
