import React, { useState, useEffect } from 'react';
import { FiSearch, FiShoppingBag, FiMail, FiPhone, FiCalendar, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import './Customers.css';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      const customerData = response.data?.filter(user => user.role === 'customer') || [];
      setCustomers(customerData);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(customer =>
    customer.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.status === 'active').length,
    totalOrders: customers.reduce((sum, c) => sum + (c.orderCount || 0), 0),
    totalSpent: customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0),
  };

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading customers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1><FiShoppingBag /> Customers</h1>
          <p>Manage customer accounts and monitor activity</p>
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-card">
          <FiShoppingBag className="stat-icon" />
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Customers</p>
          </div>
        </div>
        <div className="stat-card">
          <FiTrendingUp className="stat-icon active" />
          <div className="stat-details">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
        <div className="stat-card">
          <FiShoppingBag className="stat-icon orders" />
          <div className="stat-details">
            <h3>{stats.totalOrders}</h3>
            <p>Total Orders</p>
          </div>
        </div>
        <div className="stat-card">
          <FiTrendingUp className="stat-icon revenue" />
          <div className="stat-details">
            <h3>${(stats.totalSpent / 1000).toFixed(1)}K</h3>
            <p>Total Revenue</p>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="customers-grid">
        {filteredCustomers.length === 0 ? (
          <div className="no-data">No customers found</div>
        ) : (
          filteredCustomers.map(customer => (
            <div key={customer._id} className="customer-card">
              <div className="customer-header">
                <div className="customer-avatar">
                  {customer.name?.charAt(0).toUpperCase()}
                </div>
                <div className="customer-info">
                  <h3>{customer.name}</h3>
                  <span className={`status-badge ${customer.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {customer.status || 'active'}
                  </span>
                </div>
              </div>
              <div className="customer-details">
                <div className="detail-item">
                  <FiMail />
                  <span>{customer.email}</span>
                </div>
                <div className="detail-item">
                  <FiPhone />
                  <span>{customer.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <FiMapPin />
                  <span>{customer.address?.city || 'No address'}</span>
                </div>
                <div className="detail-item">
                  <FiCalendar />
                  <span>Joined {new Date(customer.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="customer-stats-mini">
                <div className="mini-stat">
                  <strong>{customer.orderCount || 0}</strong>
                  <span>Orders</span>
                </div>
                <div className="mini-stat">
                  <strong>${(customer.totalSpent || 0).toFixed(0)}</strong>
                  <span>Spent</span>
                </div>
              </div>
              <div className="customer-actions">
                <button className="btn-primary">View Details</button>
                <button className="btn-secondary">Contact</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Customers;
