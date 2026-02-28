import React, { useState, useEffect } from 'react';
import { FiSearch, FiUsers, FiStar, FiMapPin, FiPhone, FiMail, FiMoreVertical } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const AllDrivers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getDrivers({ limit: 100 });
      setDrivers(response.data?.drivers || []);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          driver.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Drivers', value: drivers.length, icon: FiUsers, color: 'orange' },
    { label: 'Active', value: drivers.filter(d => d.status === 'active' || d.status === 'available').length, icon: FiUsers, color: 'success' },
    { label: 'Inactive', value: drivers.filter(d => d.status === 'inactive' || d.status === 'offline').length, icon: FiUsers, color: 'warning' },
    { label: 'Avg Rating', value: drivers.length > 0 ? (drivers.reduce((acc, d) => acc + (d.rating || 0), 0) / drivers.length).toFixed(1) : '0.0', icon: FiStar, color: 'info' }
  ];

  if (loading) {
    return (
      <div className="dashboard-page">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
          <div>
            <div className="loading-spinner" style={{ margin: '0 auto 1rem' }}></div>
            <p>Loading drivers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Drivers</h1>
          <p className="page-subtitle">Manage and monitor delivery drivers</p>
        </div>
        <button className="btn btn-primary">
          <FiUsers size={18} />
          Add New Driver
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

      {/* Filters */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Driver List</h3>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="search-bar">
              <FiSearch className="search-icon" size={18} />
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="form-select" 
              style={{ width: 'auto', minWidth: '150px' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Contact</th>
                <th>Zone</th>
                <th>Vehicle</th>
                <th>Rating</th>
                <th>Deliveries</th>
                <th>Success Rate</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDrivers.map((driver) => (
                <tr key={driver._id}>
                  <td>
                    <div>
                      <div style={{ fontWeight: 600 }}>{driver.name || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        ID: #{driver._id?.substring(0, 8) || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.813rem' }}>
                        <FiPhone size={12} />
                        {driver.phone || 'N/A'}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.813rem', color: 'var(--text-secondary)' }}>
                        <FiMail size={12} />
                        {driver.email || driver.userId?.email || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiMapPin size={14} />
                      {driver.assignedZone || driver.currentZone || 'Unassigned'}
                    </div>
                  </td>
                  <td>{driver.vehicle?.type || driver.vehicleType || 'N/A'}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FiStar fill="var(--warning-color)" color="var(--warning-color)" size={14} />
                      <span style={{ fontWeight: 600 }}>{driver.rating || 0}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{driver.totalDeliveries || driver.statistics?.totalDeliveries || 0}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="progress-bar" style={{ width: '60px', height: '6px' }}>
                        <div className="progress-fill" style={{ width: `${driver.successRate || driver.statistics?.successRate || 0}%` }}></div>
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>{driver.successRate || driver.statistics?.successRate || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${driver.status}`}>{driver.status}</span>
                  </td>
                  <td>
                    <button className="btn-icon">
                      <FiMoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDrivers.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <FiUsers />
              </div>
              <div className="empty-state-title">No drivers found</div>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllDrivers;
