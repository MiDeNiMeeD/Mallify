import React, { useState, useEffect } from 'react';
import { FiSearch, FiShoppingBag, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../Users/Customers.css';

const BoutiquesUsers = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchBoutiques();
  }, []);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers();
      const boutiqueData = response.data?.filter(user => user.role === 'boutique_owner') || [];
      setBoutiques(boutiqueData);
    } catch (error) {
      console.error('Error fetching boutiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBoutiques = boutiques.filter(boutique =>
    boutique.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    boutique.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: boutiques.length,
    active: boutiques.filter(b => b.status === 'active').length,
    verified: boutiques.filter(b => b.verified).length,
    pending: boutiques.filter(b => !b.verified).length,
  };

  if (loading) {
    return (
      <div className="customers-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customers-page boutiques-page">
      <div className="page-header">
        <div>
          <h1><FiShoppingBag /> Boutique Owners</h1>
          <p>Manage boutique owner accounts</p>
        </div>
      </div>

      <div className="customers-stats">
        <div className="stat-card">
          <FiShoppingBag className="stat-icon boutique" />
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Boutiques</p>
          </div>
        </div>
        <div className="stat-card">
          <FiShoppingBag className="stat-icon verified" />
          <div className="stat-details">
            <h3>{stats.verified}</h3>
            <p>Verified</p>
          </div>
        </div>
        <div className="stat-card">
          <FiShoppingBag className="stat-icon pending" />
          <div className="stat-details">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <FiShoppingBag className="stat-icon active" />
          <div className="stat-details">
            <h3>{stats.active}</h3>
            <p>Active</p>
          </div>
        </div>
      </div>

      <div className="search-section">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search boutiques..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="customers-grid">
        {filteredBoutiques.length === 0 ? (
          <div className="no-data">No boutiques found</div>
        ) : (
          filteredBoutiques.map(boutique => (
            <div key={boutique._id} className="customer-card">
              <div className="customer-header">
                <div className="customer-avatar boutique-avatar">
                  <FiShoppingBag />
                </div>
                <div className="customer-info">
                  <h3>{boutique.name}</h3>
                  <span className={`status-badge ${boutique.verified ? 'status-verified' : 'status-pending'}`}>
                    {boutique.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="customer-details">
                <div className="detail-item">
                  <FiMail />
                  <span>{boutique.email}</span>
                </div>
                <div className="detail-item">
                  <FiPhone />
                  <span>{boutique.phone || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <FiMapPin />
                  <span>{boutique.address?.city || 'No address'}</span>
                </div>
              </div>
              <div className="customer-stats-mini">
                <div className="mini-stat">
                  <strong>{boutique.productCount || 0}</strong>
                  <span>Products</span>
                </div>
                <div className="mini-stat">
                  <strong>{boutique.orderCount || 0}</strong>
                  <span>Orders</span>
                </div>
              </div>
              <div className="customer-actions">
                <button className="btn-primary">View Store</button>
                <button className="btn-secondary">Contact</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default BoutiquesUsers;
