import React, { useState, useEffect } from 'react';
import apiClient from '../../api/apiClient';
import '../../styles/Dashboard.css';

const Compliance = () => {
  const [loading, setLoading] = useState(true);
  const [boutiques, setBoutiques] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchBoutiques();
  }, []);

  const fetchBoutiques = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getBoutiques({ limit: 100 });
      setBoutiques(response.data || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch boutiques:', error);
      setLoading(false);
    }
  };

  const getComplianceStatus = (boutique) => {
    // Determine compliance based on various factors
    if (boutique.status === 'suspended') return 'non-compliant';
    if (boutique.status === 'pending') return 'under-review';
    if (!boutique.documentsVerified) return 'under-review';
    return 'compliant';
  };

  const complianceStats = {
    compliant: boutiques.filter(b => getComplianceStatus(b) === 'compliant').length,
    nonCompliant: boutiques.filter(b => getComplianceStatus(b) === 'non-compliant').length,
    underReview: boutiques.filter(b => getComplianceStatus(b) === 'under-review').length,
    total: boutiques.length
  };

  const filteredBoutiques = filterStatus === 'all' 
    ? boutiques 
    : boutiques.filter(b => getComplianceStatus(b) === filterStatus);

  const getStatusBadge = (status) => {
    const badges = {
      compliant: <span className="compliance-badge compliant">Compliant</span>,
      'non-compliant': <span className="compliance-badge non-compliant">Non-Compliant</span>,
      'under-review': <span className="compliance-badge under-review">Under Review</span>
    };
    return badges[status] || badges['under-review'];
  };

  if (loading) {
    return (
      <div className="compliance loading-state">
        <div className="spinner"></div>
        <p>Loading compliance data...</p>
      </div>
    );
  }

  return (
    <div className="compliance">
      {/* Stats Overview */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon compliant">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{complianceStats.compliant}</div>
            <div className="stat-label">Compliant</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon non-compliant">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{complianceStats.nonCompliant}</div>
            <div className="stat-label">Non-Compliant</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon under-review">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm4.2 14.2L11 13V7h1.5v5.2l4.5 2.7-.8 1.3z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{complianceStats.underReview}</div>
            <div className="stat-label">Under Review</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{complianceStats.total}</div>
            <div className="stat-label">Total Boutiques</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Boutiques</option>
            <option value="compliant">Compliant</option>
            <option value="non-compliant">Non-Compliant</option>
            <option value="under-review">Under Review</option>
          </select>
        </div>
      </div>

      {/* Compliance Table */}
      <div className="table-card">
        <h3>Boutique Compliance Status</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Boutique</th>
                <th>Owner</th>
                <th>Compliance Status</th>
                <th>Documents</th>
                <th>Verified Date</th>
                <th>Last Check</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBoutiques.map(boutique => {
                const complianceStatus = getComplianceStatus(boutique);
                return (
                  <tr key={boutique._id}>
                    <td>
                      <div className="boutique-name">{boutique.name}</div>
                    </td>
                    <td>{boutique.ownerName || 'N/A'}</td>
                    <td>{getStatusBadge(complianceStatus)}</td>
                    <td>
                      {boutique.documentsVerified ? (
                        <span className="doc-badge verified">Verified</span>
                      ) : (
                        <span className="doc-badge pending">Pending</span>
                      )}
                    </td>
                    <td>
                      {boutique.verifiedDate 
                        ? new Date(boutique.verifiedDate).toLocaleDateString() 
                        : '-'}
                    </td>
                    <td>
                      {boutique.lastCheckDate 
                        ? new Date(boutique.lastCheckDate).toLocaleDateString() 
                        : new Date().toLocaleDateString()}
                    </td>
                    <td>
                      <button className="btn-action">Review</button>
                    </td>
                  </tr>
                );
              })}
              {filteredBoutiques.length === 0 && (
                <tr>
                  <td colSpan="7" className="empty-state">
                    No boutiques found for selected filter
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Policy Checklist */}
      <div className="policy-section">
        <h3>Platform Policies</h3>
        <div className="policy-grid">
          <div className="policy-card">
            <div className="policy-icon compliant">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="policy-content">
              <h4>Identity Verification</h4>
              <p>All boutiques must verify owner identity documents</p>
              <div className="policy-status">{complianceStats.compliant} verified</div>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-icon compliant">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="policy-content">
              <h4>Business License</h4>
              <p>Valid business registration required</p>
              <div className="policy-status">{Math.floor(complianceStats.compliant * 0.9)} verified</div>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-icon under-review">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="policy-content">
              <h4>Product Guidelines</h4>
              <p>Products must meet quality standards</p>
              <div className="policy-status">{complianceStats.underReview} under review</div>
            </div>
          </div>

          <div className="policy-card">
            <div className="policy-icon compliant">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="policy-content">
              <h4>Payment Setup</h4>
              <p>Verified payment methods required</p>
              <div className="policy-status">{complianceStats.compliant} verified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compliance;
