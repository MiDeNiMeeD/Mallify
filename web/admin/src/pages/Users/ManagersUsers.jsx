import React, { useState, useEffect } from 'react';
import { FiSearch, FiShield, FiMail, FiPhone, FiCalendar, FiUsers } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../Users/Customers.css';

const ManagersUsers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchManagers();
  }, []);

  const fetchManagers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      const managerData = response.data?.filter(user => 
        user.role === 'delivery_manager' || user.role === 'platform_manager'
      ) || [];
      setManagers(managerData);
    } catch (error) {
      console.error('Error fetching managers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredManagers = managers.filter(manager =>
    manager.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    manager.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: managers.length,
    active: managers.filter(m => m.status === 'active').length,
    deliveryManagers: managers.filter(m => m.role === 'delivery_manager').length,
    platformManagers: managers.filter(m => m.role === 'platform_manager').length,
  };

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading managers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customers-page managers-page">
      <div className="page-header">
        <div>
          <h1><FiShield /> Platform Managers</h1>
          <p>Manage platform administrators and managers</p>
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-card">
          <FiShield className="stat-icon manager" />
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Managers</p>
          </div>
        </div>
        <div className="stat-card">
          <FiShield className="stat-icon active" />
          <div className="stat-details">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card">
          <FiUsers className="stat-icon delivery" />
          <div className="stat-details">
            <h3>{stats.deliveryManagers}</h3>
            <p>Delivery Mgrs</p>
          </div>
        </div>
        <div className="stat-card">
          <FiUsers className="stat-icon platform" />
          <div className="stat-details">
            <h3>{stats.platformManagers}</h3>
            <p>Platform Mgrs</p>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search managers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="customers-grid">
        {filteredManagers.length === 0 ? (
          <div className="no-data">No managers found</div>
        ) : (
          filteredManagers.map(manager => (
            <div key={manager._id} className="customer-card">
              <div className="customer-header">
                <div className="customer-avatar manager-avatar">
                  <FiShield />
                </div>
                <div className="customer-info">
                  <h3>{manager.name}</h3>
                  <span className={`status-badge status-manager`}>
                    {manager.role === 'delivery_manager' ? 'Delivery' : 'Platform'}
                  </span>
                </div>
              </div>
              <div className="customer-details">
                <div className="detail-item">
                  <FiMail />
                  <span>{manager.email}</span>
                </div>
                <div className="detail-item">
                  <FiPhone />
                  <span>{manager.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <FiCalendar />
                  <span>Joined {new Date(manager.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <FiShield />
                  <span className={`status-badge ${manager.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {manager.status || 'active'}
                  </span>
                </div>
              </div>
              <div className="customer-actions">
                <button className="btn-primary">View Details</button>
                <button className="btn-secondary">Permissions</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagersUsers;
