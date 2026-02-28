import React, { useState, useEffect } from 'react';
import { Tag, Plus, Eye, Edit2, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

function AllPromotions() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchPromotions = async () => {
      if (!user?.boutiqueList?.[0]) {
        setError('No boutique found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.getPromotions({ boutiqueId: user.boutiqueList[0] });
        if (response.success) {
          setPromotions(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching promotions:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, [user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const filteredPromotions = promotions.filter(promo => {
    const matchesSearch = promo.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || promo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: promotions.length,
    active: promotions.filter(p => p.status === 'active').length,
    scheduled: promotions.filter(p => p.status === 'scheduled').length,
    expired: promotions.filter(p => p.status === 'expired').length
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this promotion?')) return;
    try {
      await apiClient.deletePromotion(id);
      setPromotions(promotions.filter(p => p._id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading promotions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">All Promotions</h1>
          <p className="page-subtitle">Manage all your promotional campaigns and offers</p>
        </div>
        <button className="btn-primary">
          <Plus size={18} />
          Create Promotion
        </button>
      </div>

      {error && (
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Total Promotions</span>
            <div className="stat-icon pink"><Tag size={20} /></div>
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Active</span>
            <div className="stat-icon success"><Tag size={20} /></div>
          </div>
          <div className="stat-value">{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Scheduled</span>
            <div className="stat-icon info"><Tag size={20} /></div>
          </div>
          <div className="stat-value">{stats.scheduled}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Expired</span>
            <div className="stat-icon warning"><Tag size={20} /></div>
          </div>
          <div className="stat-value">{stats.expired}</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Promotions List</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              className="search-bar"
              placeholder="Search promotions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select 
              className="form-input" 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          <table className="data-table">
            <thead>
              <tr>
                <th>Promotion Name</th>
                <th>Type</th>
                <th>Discount</th>
                <th>Code</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Uses</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <div className="empty-state">
                      <Tag size={48} />
                      <p>No promotions found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promo) => (
                  <tr key={promo._id}>
                    <td><strong>{promo.name}</strong></td>
                    <td>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        backgroundColor: 'var(--light-bg)', 
                        borderRadius: '4px',
                        fontSize: '0.875rem'
                      }}>
                        {promo.type}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--primary-color)' }}>
                        {promo.discountType === 'percentage' ? `${promo.discountValue}%` : `$${promo.discountValue}`}
                      </strong>
                    </td>
                    <td>
                      <code style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'var(--light-bg)',
                        borderRadius: '4px',
                        fontFamily: 'monospace'
                      }}>
                        {promo.code}
                      </code>
                    </td>
                    <td>{new Date(promo.startDate).toLocaleDateString()}</td>
                    <td>{new Date(promo.endDate).toLocaleDateString()}</td>
                    <td>{promo.currentUses || 0} / {promo.maxUses === 0 ? '∞' : promo.maxUses}</td>
                    <td>
                      <span className={`status-badge ${promo.status === 'active' ? 'completed' : promo.status === 'scheduled' ? 'pending' : 'cancelled'}`}>
                        {promo.status}
                      </span>
                    </td>
                    <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" title="View">
                        <Eye size={16} />
                      </button>
                        <button className="btn-icon" title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button className="btn-icon" title="Delete" onClick={() => handleDelete(promo._id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
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
}

export default AllPromotions;
