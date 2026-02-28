import React, { useEffect, useState } from 'react';
import { FiSearch, FiShoppingBag, FiCheckCircle, FiClock, FiXCircle, FiEye } from 'react-icons/fi';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const AllBoutiques = () => {
  const [boutiques, setBoutiques] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchBoutiques();
  }, []);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBoutiques({ limit: 100 });
      setBoutiques(response.data?.boutiques || []);
    } catch (error) {
      console.error('Error fetching boutiques:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBoutiques = boutiques.filter(b => {
    const matchesSearch = b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         b.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: boutiques.length,
    active: boutiques.filter(b => b.status === 'active').length,
    pending: boutiques.filter(b => b.status === 'pending').length,
    suspended: boutiques.filter(b => b.status === 'suspended').length,
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="loading-spinner"></div>
          <p>Loading boutiques...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Boutiques</h1>
          <p className="page-subtitle">Manage and monitor all registered boutiques</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Boutiques</span>
            <div className="stat-icon pink">
              <FiShoppingBag />
            </div>
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active</span>
            <div className="stat-icon success">
              <FiCheckCircle />
            </div>
          </div>
          <div className="stat-value">{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending</span>
            <div className="stat-icon warning">
              <FiClock />
            </div>
          </div>
          <div className="stat-value">{stats.pending}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Suspended</span>
            <div className="stat-icon danger">
              <FiXCircle />
            </div>
          </div>
          <div className="stat-value">{stats.suspended}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="filter-group">
          <div className="search-bar">
            <FiSearch className="search-icon" />
            <input
              type="text"
              className="search-input"
              placeholder="Search boutiques by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="filter-group" style={{ maxWidth: '200px' }}>
          <select 
            className="form-select" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Boutiques Table */}
      <div className="content-card">
        <div className="card-header">
          <h3 className="card-title">Boutiques List</h3>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Boutique</th>
                <th>Owner Email</th>
                <th>Status</th>
                <th>Products</th>
                <th>Total Sales</th>
                <th>Orders</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBoutiques.length === 0 ? (
                <tr>
                  <td colSpan="8" className="empty-state">
                    <FiShoppingBag className="empty-state-icon" />
                    <div className="empty-state-title">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No boutiques match your filters' 
                        : 'No boutiques found'}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBoutiques.map((boutique) => (
                  <tr key={boutique._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {boutique.logo && (
                          <img 
                            src={boutique.logo} 
                            alt="" 
                            style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '8px', 
                              objectFit: 'cover' 
                            }} 
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>{boutique.name}</div>
                          {boutique.description && (
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                              {boutique.description.substring(0, 50)}...
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td>{boutique.email}</td>
                    <td>
                      <span className={`status-badge ${boutique.status}`}>
                        {boutique.status}
                      </span>
                    </td>
                    <td>{boutique.productCount || 0}</td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(boutique.totalSales || 0)}</td>
                    <td>{boutique.totalOrders || 0}</td>
                    <td>{new Date(boutique.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
                        <FiEye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllBoutiques;
