import React, { useState, useEffect } from 'react';
import { FiSearch, FiShoppingBag, FiMapPin, FiPackage, FiDollarSign, FiStar, FiTrendingUp } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import './AllBoutiques.css';

const AllBoutiquesPage = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBoutiques();
  }, []);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBoutiques();
      setBoutiques(response.data || []);
    } catch (error) {
      console.error('Error fetching boutiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (boutiqueId, newStatus) => {
    try {
      await apiClient.updateBoutiqueStatus(boutiqueId, newStatus);
      setBoutiques(boutiques.map(b => 
        b._id === boutiqueId ? { ...b, status: newStatus } : b
      ));
    } catch (error) {
      console.error('Error updating boutique status:', error);
      alert('Failed to update status');
    }
  };

  const filteredBoutiques = boutiques.filter(boutique => {
    const matchesSearch = boutique.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         boutique.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || boutique.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: boutiques.length,
    active: boutiques.filter(b => b.status === 'active').length,
    pending: boutiques.filter(b => b.status === 'pending').length,
    suspended: boutiques.filter(b => b.status === 'suspended').length,
    verified: boutiques.filter(b => b.verified).length,
  };

  if (loading) {
    return (
      <div className="all-boutiques-page">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="all-boutiques-page">
      <div className="page-header">
        <div>
          <h1><FiShoppingBag /> All Boutiques</h1>
          <p>Manage and monitor all boutiques on the platform</p>
        </div>
      </div>

      <div className="boutiques-stats">
        <div className="stat-card">
          <FiShoppingBag className="stat-icon" />
          <div className="stat-details">
            <h3>{stats.total}</h3>
            <p>Total Boutiques</p>
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
          <FiShoppingBag className="stat-icon pending" />
          <div className="stat-details">
            <h3>{stats.pending}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <FiStar className="stat-icon verified" />
          <div className="stat-details">
            <h3>{stats.verified}</h3>
            <p>Verified</p>
          </div>
        </div>
      </div>

      <div className="boutiques-filters">
        <div className="search-box">
          <FiSearch />
          <input
            type="text"
            placeholder="Search boutiques..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      <div className="boutiques-grid">
        {filteredBoutiques.length === 0 ? (
          <div className="no-data">No boutiques found</div>
        ) : (
          filteredBoutiques.map(boutique => (
            <div key={boutique._id} className="boutique-card">
              <div className="boutique-image">
                {boutique.logo ? (
                  <img src={boutique.logo} alt={boutique.name} />
                ) : (
                  <div className="placeholder-image">
                    <FiShoppingBag />
                  </div>
                )}
                <span className={`status-badge status-${boutique.status || 'pending'}`}>
                  {boutique.status || 'pending'}
                </span>
              </div>
              <div className="boutique-content">
                <h3>{boutique.name}</h3>
                <p className="boutique-description">
                  {boutique.description || 'No description available'}
                </p>
                <div className="boutique-details">
                  <div className="detail-row">
                    <FiMapPin />
                    <span>{boutique.address?.city || 'No location'}</span>
                  </div>
                  <div className="detail-row">
                    <FiPackage />
                    <span>{boutique.productCount || 0} Products</span>
                  </div>
                  <div className="detail-row">
                    <FiDollarSign />
                    <span>${(boutique.revenue || 0).toFixed(0)} Revenue</span>
                  </div>
                  <div className="detail-row">
                    <FiStar />
                    <span>{boutique.rating ? boutique.rating.toFixed(1) : 'N/A'} Rating</span>
                  </div>
                </div>
                <div className="boutique-actions">
                  <button className="btn-primary">View Store</button>
                  {boutique.status === 'pending' && (
                    <button 
                      className="btn-approve"
                      onClick={() => handleStatusUpdate(boutique._id, 'active')}
                    >
                      Approve
                    </button>
                  )}
                  {boutique.status === 'active' && (
                    <button 
                      className="btn-suspend"
                      onClick={() => handleStatusUpdate(boutique._id, 'suspended')}
                    >
                      Suspend
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AllBoutiquesPage;
