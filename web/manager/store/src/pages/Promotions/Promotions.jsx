import React, { useState, useEffect } from 'react';
import '../../styles/Dashboard.css';

const Promotions = () => {
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [promotions, setPromotions] = useState([
    {
      id: 1,
      name: 'Summer Sale 2024',
      type: 'percentage',
      value: 20,
      status: 'active',
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      usageCount: 156,
      maxUsage: 1000,
      appliedTo: 'All boutiques'
    },
    {
      id: 2,
      name: 'New Customer Discount',
      type: 'fixed',
      value: 10,
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      usageCount: 423,
      maxUsage: null,
      appliedTo: 'New customers'
    },
    {
      id: 3,
      name: 'Black Friday',
      type: 'percentage',
      value: 30,
      status: 'scheduled',
      startDate: '2024-11-24',
      endDate: '2024-11-30',
      usageCount: 0,
      maxUsage: 5000,
      appliedTo: 'All boutiques'
    },
    {
      id: 4,
      name: 'Spring Clearance',
      type: 'percentage',
      value: 25,
      status: 'expired',
      startDate: '2024-03-01',
      endDate: '2024-05-31',
      usageCount: 892,
      maxUsage: 1000,
      appliedTo: 'All boutiques'
    }
  ]);

  const [newPromotion, setNewPromotion] = useState({
    name: '',
    type: 'percentage',
    value: '',
    startDate: '',
    endDate: '',
    maxUsage: '',
    appliedTo: 'all'
  });

  const stats = {
    active: promotions.filter(p => p.status === 'active').length,
    scheduled: promotions.filter(p => p.status === 'scheduled').length,
    expired: promotions.filter(p => p.status === 'expired').length,
    total: promotions.length
  };

  const handleCreatePromotion = (e) => {
    e.preventDefault();
    const newPromo = {
      id: promotions.length + 1,
      ...newPromotion,
      status: 'scheduled',
      usageCount: 0,
      maxUsage: newPromotion.maxUsage ? parseInt(newPromotion.maxUsage) : null,
      value: parseInt(newPromotion.value),
      appliedTo: newPromotion.appliedTo === 'all' ? 'All boutiques' : 'Selected boutiques'
    };
    setPromotions([newPromo, ...promotions]);
    setShowCreateForm(false);
    setNewPromotion({
      name: '',
      type: 'percentage',
      value: '',
      startDate: '',
      endDate: '',
      maxUsage: '',
      appliedTo: 'all'
    });
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: <span className="promo-badge active">Active</span>,
      scheduled: <span className="promo-badge scheduled">Scheduled</span>,
      expired: <span className="promo-badge expired">Expired</span>
    };
    return badges[status];
  };

  const formatValue = (type, value) => {
    return type === 'percentage' ? `${value}%` : `$${value}`;
  };

  return (
    <div className="promotions">
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L3 7v5c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.active}</div>
            <div className="stat-label">Active Promotions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon scheduled">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.scheduled}</div>
            <div className="stat-label">Scheduled</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon expired">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.expired}</div>
            <div className="stat-label">Expired</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.41 11.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l9 9c.36.36.86.58 1.41.58.55 0 1.05-.22 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.55-.23-1.06-.59-1.42zM5.5 7C4.67 7 4 6.33 4 5.5S4.67 4 5.5 4 7 4.67 7 5.5 6.33 7 5.5 7z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Promotions</div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="action-bar">
        <button className="btn-create" onClick={() => setShowCreateForm(!showCreateForm)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Create New Promotion
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="create-form-card">
          <h3>Create New Promotion</h3>
          <form onSubmit={handleCreatePromotion}>
            <div className="form-grid">
              <div className="form-group">
                <label>Promotion Name</label>
                <input
                  type="text"
                  value={newPromotion.name}
                  onChange={(e) => setNewPromotion({...newPromotion, name: e.target.value})}
                  required
                  placeholder="e.g., Summer Sale 2024"
                />
              </div>

              <div className="form-group">
                <label>Discount Type</label>
                <select
                  value={newPromotion.type}
                  onChange={(e) => setNewPromotion({...newPromotion, type: e.target.value})}
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div className="form-group">
                <label>Discount Value</label>
                <input
                  type="number"
                  value={newPromotion.value}
                  onChange={(e) => setNewPromotion({...newPromotion, value: e.target.value})}
                  required
                  placeholder={newPromotion.type === 'percentage' ? '20' : '10'}
                />
              </div>

              <div className="form-group">
                <label>Apply To</label>
                <select
                  value={newPromotion.appliedTo}
                  onChange={(e) => setNewPromotion({...newPromotion, appliedTo: e.target.value})}
                >
                  <option value="all">All Boutiques</option>
                  <option value="selected">Selected Boutiques</option>
                </select>
              </div>

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={newPromotion.startDate}
                  onChange={(e) => setNewPromotion({...newPromotion, startDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={newPromotion.endDate}
                  onChange={(e) => setNewPromotion({...newPromotion, endDate: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Max Usage (Optional)</label>
                <input
                  type="number"
                  value={newPromotion.maxUsage}
                  onChange={(e) => setNewPromotion({...newPromotion, maxUsage: e.target.value})}
                  placeholder="Leave empty for unlimited"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
              <button type="submit" className="btn-submit">
                Create Promotion
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Promotions Table */}
      <div className="table-card">
        <h3>All Promotions</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Promotion Name</th>
                <th>Discount</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Usage</th>
                <th>Applied To</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promotions.map(promo => (
                <tr key={promo.id}>
                  <td>
                    <div className="promo-name">{promo.name}</div>
                  </td>
                  <td className="discount-cell">{formatValue(promo.type, promo.value)}</td>
                  <td>{getStatusBadge(promo.status)}</td>
                  <td>{new Date(promo.startDate).toLocaleDateString()}</td>
                  <td>{new Date(promo.endDate).toLocaleDateString()}</td>
                  <td>
                    <div className="usage-info">
                      {promo.usageCount} {promo.maxUsage ? `/ ${promo.maxUsage}` : ''}
                    </div>
                  </td>
                  <td>{promo.appliedTo}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit">Edit</button>
                      {promo.status === 'active' && (
                        <button className="btn-pause">Pause</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Promotions;
