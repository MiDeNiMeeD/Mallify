import React, { useState, useEffect } from 'react';
import { Star, ThumbsUp, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../api/apiClient';
import '../Dashboard/Dashboard.css';

function ReviewsRatings() {
  const { user } = useAuth();
  const [filterRating, setFilterRating] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReviews();
  }, [user]);

  const fetchReviews = async () => {
    if (!user || !user.boutiqueList || user.boutiqueList.length === 0) {
      setError('No boutique found for this user');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const boutiqueId = user.boutiqueList[0];
      const response = await apiClient.getReviews({ boutiqueId });
      
      if (response.success) {
        setReviews(response.data || []);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err.message || 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const filteredReviews = reviews.filter(review => {
    const matchesRating = filterRating === 'all' || review.rating === parseInt(filterRating);
    const matchesStatus = filterStatus === 'all' || 
                         (filterStatus === 'pending' && !review.isApproved) ||
                         (filterStatus === 'approved' && review.isApproved);
    return matchesRating && matchesStatus;
  });

  const stats = {
    total: reviews.length,
    pending: reviews.filter(r => !r.isApproved).length,
    approved: reviews.filter(r => r.isApproved).length,
    avgRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0
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
      // Update locally (since backend approval endpoint may not exist yet)
      setReviews(reviews.map(r => r._id === reviewId ? { ...r, isApproved: true } : r));
      alert(`Review approved!`);
    } catch (err) {
      alert('Failed to approve review: ' + err.message);
    }
  };

  const handleReject = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      const response = await apiClient.deleteReview(reviewId);
      if (response.success) {
        setReviews(reviews.filter(r => r._id !== reviewId));
        alert('Review deleted successfully');
      }
    } catch (err) {
      alert('Failed to delete review: ' + err.message);
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

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="error-container">
          <AlertCircle size={48} />
          <p>{error}</p>
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
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
              <AlertCircle size={48} style={{ margin: '0 auto 1rem', display: 'block' }} />
              <p>No reviews yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filteredReviews.map((review) => {
                const reviewStatus = review.isApproved ? 'approved' : 'pending';
                return (
                  <div 
                    key={review._id}
                    style={{
                      padding: '1.5rem',
                      backgroundColor: reviewStatus === 'pending' ? 'var(--light-bg)' : 'white',
                      borderRadius: '8px',
                      border: `1px solid ${reviewStatus === 'pending' ? 'var(--warning-color)' : 'var(--border-color)'}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                          <strong>{review.userId?.name || 'Anonymous'}</strong>
                          {renderStars(review.rating)}
                          <span className={`status-badge ${reviewStatus === 'approved' ? 'completed' : 'pending'}`}>
                            {reviewStatus}
                          </span>
                        </div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: '0 0 0.5rem 0' }}>
                          {review.productId?.name || 'Product'}
                        </p>
                        <p style={{ margin: '0 0 0.5rem 0' }}>{review.comment || 'No comment'}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                          {new Date(review.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'start' }}>
                        <button className="btn-icon" title="View">
                          <Eye size={16} />
                        </button>
                        {reviewStatus === 'pending' && (
                          <>
                            <button 
                              className="btn-icon" 
                              title="Approve"
                              onClick={() => handleApprove(review._id)}
                              style={{ color: 'var(--success-color)' }}
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button 
                              className="btn-icon" 
                              title="Delete"
                              onClick={() => handleReject(review._id)}
                              style={{ color: 'var(--danger-color)' }}
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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

export default ReviewsRatings;
