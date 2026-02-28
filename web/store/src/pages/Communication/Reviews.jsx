import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

function Reviews() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchReviews = async () => {
      if (!user?.boutiqueList?.[0]) {
        setError('No boutique found');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.getReviews({ boutiqueId: user.boutiqueList[0] });
        if (response.success) {
          setReviews(response.data || []);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [user]);

  const filteredReviews = reviews.filter(review => {
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    const matchesStatus = filterStatus === 'all' || review.status === filterStatus;
    return matchesRating && matchesStatus;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => r.status === 'pending').length,
    approved: reviews.filter(r => r.status === 'approved').length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : '0.0'
  };

  const renderStars = (rating) => {
    return (
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            fill={star <= rating ? 'var(--warning-color)' : 'none'}
            stroke={star <= rating ? 'var(--warning-color)' : 'var(--border-color)'}
          />
        ))}
      </div>
    );
  };

  const handleApprove = async (reviewId) => {
    try {
      // Note: API doesn't have approve endpoint yet, you may need to add it
      alert(`Review ${reviewId} approved!`);
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleReject = async (reviewId) => {
    try {
      await apiClient.deleteReview(reviewId);
      setReviews(reviews.filter(r => r._id !== reviewId));
    } catch (err) {
      alert('Failed to reject');
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading reviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews & Ratings</h1>
          <p className="page-subtitle">Manage customer reviews and product ratings</p>
        </div>
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
            <span className="stat-label">Total Reviews</span>
            <div className="stat-icon pink"><Star size={20} /></div>
          </div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Average Rating</span>
            <div className="stat-icon warning"><Star size={20} /></div>
          </div>
          <div className="stat-value">{stats.avgRating}</div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.5rem' }}>
            {renderStars(Math.round(parseFloat(stats.avgRating)))}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Pending</span>
            <div className="stat-icon info"><Star size={20} /></div>
          </div>
          <div className="stat-value">{stats.pending}</div>
          {stats.pending > 0 && <div className="stat-trend negative">⚠️ Needs review</div>}
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-label">Approved</span>
            <div className="stat-icon success"><CheckCircle size={20} /></div>
          </div>
          <div className="stat-value">{stats.approved}</div>
        </div>
      </div>

      <div className="content-card">
        <div className="card-header">
          <h2 className="card-title">Customer Reviews</h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <select 
              className="form-input" 
              value={filterRating}
              onChange={(e) => setFilterRating(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <select 
              className="form-input" 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
        <div className="card-body">
          {filteredReviews.length === 0 ? (
            <div className="empty-state">
              <Star size={48} />
              <p>No reviews found</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredReviews.map((review) => (
                <div 
                  key={review._id}
                  style={{
                    padding: '1.5rem',
                    backgroundColor: review.status === 'pending' ? 'var(--light-bg)' : 'white',
                    borderRadius: '8px',
                    border: `1px solid ${review.status === 'pending' ? 'var(--warning-color)' : 'var(--border-color)'}`,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <strong>{review.userId?.name || 'Anonymous'}</strong>
                        {renderStars(review.rating)}
                        <span className={`status-badge ${review.status === 'approved' ? 'completed' : 'pending'}`}>
                          {review.status}
                        </span>
                      </div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                        {review.productId?.name || 'Product'}
                      </p>
                      <p style={{ margin: '0 0 0.5rem 0' }}>{review.comment}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                        {new Date(review.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                      <button className="btn-icon" title="View">
                      <Eye size={16} />
                    </button>
                    {review.status === 'pending' && (
                      <>
                        <button 
                          className="btn-icon" 
                          title="Approve"
                          onClick={() => handleApprove(review.id)}
                          style={{ color: 'var(--success-color)' }}
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          title="Reject"
                          onClick={() => handleReject(review.id)}
                          style={{ color: 'var(--danger-color)' }}
                        >
                          <XCircle size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Rating Breakdown</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const percentage = (count / reviews.length) * 100;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: '80px' }}>
                      <span>{star}</span>
                      <Star size={14} fill="var(--warning-color)" stroke="var(--warning-color)" />
                    </div>
                    <div style={{ 
                      flex: 1, 
                      height: '8px', 
                      backgroundColor: 'var(--light-bg)', 
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${percentage}%`,
                        height: '100%',
                        backgroundColor: 'var(--warning-color)',
                        borderRadius: '4px'
                      }} />
                    </div>
                    <span style={{ minWidth: '60px', textAlign: 'right', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                      {count} ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">Review Management</h2>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Auto-Approval Settings</label>
              <select className="form-select">
                <option>Manual approval required</option>
                <option>Auto-approve 4-5 star reviews</option>
                <option>Auto-approve all reviews</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="checkbox"
                defaultChecked
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary-color)'
                }}
              />
              <label style={{ margin: 0 }}>Email notification for new reviews</label>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="checkbox"
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer',
                  accentColor: 'var(--primary-color)'
                }}
              />
              <label style={{ margin: 0 }}>Allow customers to upload photos</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reviews;
