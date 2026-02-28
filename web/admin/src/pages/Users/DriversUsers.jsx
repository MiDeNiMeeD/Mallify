import React, { useState, useEffect } from 'react';
import { FiSearch, FiTruck, FiMail, FiPhone, FiMapPin, FiPackage, FiStar } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../Users/Customers.css';

const DriversUsers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      const driverData = response.data?.filter(user => user.role === 'driver') || [];
      setDrivers(driverData);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.status === 'active').length,
    online: drivers.filter(d => d.onlineStatus === 'online').length,
    totalDeliveries: drivers.reduce((sum, d) => sum + (d.deliveryCount || 0), 0),
  };

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading drivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customers-page drivers-page">
      <div className="page-header">
        <div>
          <h1><FiTruck /> Drivers</h1>
          <p>Manage driver accounts and performance</p>
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-card">
          <FiTruck className="stat-icon driver" />
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Drivers</p>
          </div>
        </div>
        <div className="stat-card">
          <FiTruck className="stat-icon active" />
          <div className="stat-details">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card">
          <FiTruck className="stat-icon online" />
          <div className="stat-details">
            <h3>{stats.online}</h3>
            <p>Online Now</p>
          </div>
        </div>
        <div className="stat-card">
          <FiPackage className="stat-icon deliveries" />
          <div className="stat-details">
            <h3>{stats.totalDeliveries}</h3>
            <p>Total Deliveries</p>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search drivers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="customers-grid">
        {filteredDrivers.length === 0 ? (
          <div className="no-data">No drivers found</div>
        ) : (
          filteredDrivers.map(driver => (
            <div key={driver._id} className="customer-card">
              <div className="customer-header">
                <div className="customer-avatar driver-avatar">
                  <FiTruck />
                </div>
                <div className="customer-info">
                  <h3>{driver.name}</h3>
                  <span className={`status-badge ${driver.onlineStatus === 'online' ? 'status-online' : 'status-offline'}`}>
                    {driver.onlineStatus || 'offline'}
                  </span>
                </div>
              </div>
              <div className="customer-details">
                <div className="detail-item">
                  <FiMail />
                  <span>{driver.email}</span>
                </div>
                <div className="detail-item">
                  <FiPhone />
                  <span>{driver.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <FiMapPin />
                  <span>{driver.zone || 'Unassigned'}</span>
                </div>
                <div className="detail-item">
                  <FiStar />
                  <span>Rating: {driver.rating ? driver.rating.toFixed(1) : 'N/A'}</span>
                </div>
              </div>
              <div className="customer-stats-mini">
                <div className="mini-stat">
                  <strong>{driver.deliveryCount || 0}</strong>
                  <span>Deliveries</span>
                </div>
                <div className="mini-stat">
                  <strong>${(driver.earnings || 0).toFixed(0)}</strong>
                  <span>Earnings</span>
                </div>
              </div>
              <div className="customer-actions">
                <button className="btn-primary">View Profile</button>
                <button className="btn-secondary">Contact</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DriversUsers;
