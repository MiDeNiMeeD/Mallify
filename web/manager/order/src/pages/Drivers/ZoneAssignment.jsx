import React, { useState, useEffect } from 'react';
import { FiMap, FiUsers, FiTruck, FiClock } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const ZoneAssignment = () => {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getZones({ limit: 100 });
      if (response.success) {
        setZones(response.data?.zones || []);
      }
    } catch (error) {
      console.error('Error fetching zones:', error);
      setError('Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  const totalDrivers = zones.reduce((acc, zone) => acc + (zone.driversCount || zone.assignedDrivers?.length || 0), 0);
  const totalDeliveries = zones.reduce((acc, zone) => acc + (zone.activeDeliveries || 0), 0);

  const stats = [
    { label: 'Total Zones', value: zones.length, icon: FiMap, color: 'orange' },
    { label: 'Active Drivers', value: totalDrivers, icon: FiUsers, color: 'success' },
    { label: 'Active Deliveries', value: totalDeliveries, icon: FiTruck, color: 'info' },
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-spinner">Loading zones...</div>
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
          <h1 className="page-title">Zone Assignment</h1>
          <p className="page-subtitle">Assign drivers to delivery zones and manage coverage</p>
        </div>
        <button className="btn btn-primary">
          <FiMap size={18} />
          Create New Zone
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

      {/* Zone Cards */}
      <div className="grid-2">
        {zones.map((zone) => (
          <div key={zone._id} className="content-card">
            <div className="card-header">
              <div>
                <h3 className="card-title">{zone.name}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Zone ID: #{zone._id?.slice(-6) || zone.zoneId || 'N/A'}
                </p>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: '0.813rem', padding: '0.5rem 1rem' }}>
                Manage
              </button>
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gap: '1rem' }}>
                {/* Drivers */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--bg-primary)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      background: 'linear-gradient(135deg, rgba(254, 128, 1, 0.1), rgba(214, 130, 16, 0.1))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiUsers size={20} color="var(--primary-orange)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Drivers</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
                        {zone.driversCount || zone.assignedDrivers?.length || 0}
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                    Assign
                  </button>
                </div>

                {/* Active Deliveries */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--info-light)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiTruck size={20} color="var(--info-color)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--info-color)' }}>Active Deliveries</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--info-color)' }}>
                        {zone.activeDeliveries || 0}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avg Delivery Time */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'var(--success-light)', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '10px', 
                      background: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FiClock size={20} color="var(--success-color)" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--success-color)' }}>Avg Delivery Time</div>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                        {zone.avgDeliveryTime || zone.averageDeliveryTime || 'N/A'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coverage Status */}
                <div style={{ padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.813rem', fontWeight: 600 }}>Coverage Status</span>
                    <span className={`status-badge ${(zone.driversCount || zone.assignedDrivers?.length || 0) >= 5 ? 'completed' : (zone.driversCount || zone.assignedDrivers?.length || 0) >= 3 ? 'pending' : 'cancelled'}`}>
                      {(zone.driversCount || zone.assignedDrivers?.length || 0) >= 5 ? 'Optimal' : (zone.driversCount || zone.assignedDrivers?.length || 0) >= 3 ? 'Adequate' : 'Understaffed'}
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ 
                        width: `${Math.min(((zone.driversCount || zone.assignedDrivers?.length || 0) / 8) * 100, 100)}%`,
                        background: (zone.driversCount || zone.assignedDrivers?.length || 0) >= 5 ? 'linear-gradient(135deg, #10B981, #059669)' : 
                                   (zone.driversCount || zone.assignedDrivers?.length || 0) >= 3 ? 'linear-gradient(135deg, #F59E0B, #D97706)' :
                                   'linear-gradient(135deg, #EF4444, #DC2626)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZoneAssignment;
